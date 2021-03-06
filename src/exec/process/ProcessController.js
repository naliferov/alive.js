import OsExec from "./OsExec.js";
import FS from "../../io/fs/FS.js";

export default class ProcessController {

    execFileName;
    processName;
    fs;

    constructor() {
        this.fs = new FS;
    }

    getName() { return this.processName; }

    getProcessDir(processName) {
        return `${__dirname}/process'/${processName}`;
    }

    getProcessDirFileNames(processName) {
        return {
            logFile: `${this.getProcessDir(processName)}/${processName}.log`,
            pidFile: `${this.getProcessDir(processName)}/${processName}.pid`,
        }
    };

    async run(processName, callable, args, deps) {

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

    async stop(processName, logger, fs) {

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

        //?????????????????? ?????????? ps aux ???????????????????? ???????????????? ?? ?????????? pid, ?? ???????? ???????????? ??????, ???? ?????????????? pid
        await fs.rm(pidFile);

        //?????????? ?????????? ?????????????????? ?????????????? ?? ???????? ?????????????? ?????????? ?????????? 5 ???????????? ????????????????, ?????????????????? kill -9
    }
}