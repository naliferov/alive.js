import {parseCliArgs} from "./src/F";
import Logger from "./src/log/Logger";
import FS from "./src/io/fs/FS";
import StateManager from "./src/io/state/StateManager";
import ProcessController from "./src/exec/process/ProcessController";
import {cmdList} from "./src/exec/process/CmdList";
import MongoManager from "./src/io/db/MongoManager";

const cmdRun = async (cliArgs, deps) => {

    const {logger} = deps;
    const cmd = cliArgs.cmd || cliArgs[0];

    if (!cmd) {
        logger.info(`Сmd not set.`);
        return;
    }
    if (!cmdList[cmd]) {
        logger.info(`Сmd [${cmd}] not found.`);
        return;
    }
    logger.info(`Try execute cmd [${cmd}].`);

    if (new Set(['install', 'stop']).has(cmd)) {
        await cmdList[cmd](cliArgs, deps);
        return;
    }

    await deps.processController.run(cmd, cmdList[cmd], cliArgs, deps);
};

const main = async () => {
    const fs = new FS();
    const cliArgs = parseCliArgs(process.argv);
    const config = JSON.parse(await fs.readFile('./config/config.json'));
    await cmdRun(cliArgs, {
        appDir: __dirname,
        ctxDir: process.cwd(),
        fs: fs,
        logger: new Logger(fs),
        processController: new ProcessController(),
        stateManager: new StateManager(fs),
        mongoManager: new MongoManager().createMongoClient(config.mongodb),
    });
}

main();