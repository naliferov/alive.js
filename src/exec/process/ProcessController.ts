import OsExec from "./OsExec";
import FS from "../../io/fs/FS";
import {PROCESS_DIR} from "../../AppConstants";
import Logger from "../../log/Logger";

export default class ProcessController {

    path: string;
    execFileName: string;
    processName: string;
    exec: OsExec;
    fs: FS;

    constructor() {
        this.fs = new FS;
    }

    getName(): string { return this.processName; }
    getExecFileName(): string { return this.execFileName; }

    async canRun() {}

    getProcessDir(processName: string): string {
        return `${__dirname}/${PROCESS_DIR}/${processName}`;
    }

    getProcessDirFileNames(processName) {
        return {
            logFile: `${this.getProcessDir(processName)}/${processName}.log`,
            pidFile: `${this.getProcessDir(processName)}/${processName}.pid`,
        }
    };

    async run(processName, callable, args: {}, deps) {

        const {logger} = deps;
        logger.info(`Run process [${processName}]. PID: [${process.pid.toString()}]. CliArgs:`, args);
        await callable(args, deps);

        return;

        const processDir = this.getProcessDir(processName);
        const {logFile, pidFile} = this.getProcessDirFileNames(processName);

        //if (!await this.fs.exists(processDir)) await this.fs.mkDir(processDir);

        await logger.enableLoggingToFile(logFile);

        //todo also check pid with ps aux
        /*if (await this.fs.exists(pidFile)) {
            await logger.info(`PID file [${pidFile}] exists. Try to stop old processList before starting new processList.`);
            return;
        }*/

        const rmProcessFile = async () => {
            await logger.disableLoggingToFile();
            try { this.fs.rmSync(pidFile); }
            catch (e) { await logger.info('error', {e, pidFile}); }
        }


        //await this.fs.writeFile(pidFile, process.pid.toString());

        process.on('exit', async (code) => {
            logger.info(`Stop process. Code: [${code}].`);
        });
        process.on('SIGINT', async (e) => {
            logger.info('Caught interrupt signal');
            //await rmProcessFile();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger.info(`SIGTERM for process [${processName}].`);
            //await rmProcessFile();
            process.exit(0);
        });
    }

    async stop(processName: string, logger: Logger, fs: FS) {

        const {logFile, pidFile} = this.getProcessDirFileNames(processName);
        //todo argument for stop and remove logs

        if (!await fs.exists(pidFile)) {
            await logger.info(`Process [${processName}] not exists.`);
            return;
        }
        const pid = await fs.readFile(pidFile);
        if (!pid) {
            await logger.info(`Pid not found in  ${processName} not exists.`);
            return;
        }
        const osExec = new OsExec('kill', [pid], '', logger);
        await osExec.run();

        //проверить через ps aux отсутствие процесса с таким pid, и если такого нет, то удалить pid
        await fs.rm(pidFile);

        //после этого запустить займаут и если процесс висит через 5 секунд ожидания, выполнить kill -9
    }
}