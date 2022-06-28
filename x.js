import {parseCliArgs} from "./src/F.js";
import Logger from "./src/log/Logger.js";
import FS from "./src/io/fs/FS.js";
import ProcessController from "./src/exec/process/ProcessController.js";
import {cmdList} from "./src/exec/CmdList.js";
import MongoManager from "./src/io/db/MongoManager.js";

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
    const logger = new Logger(fs);

    await cmdRun(cliArgs, {
        appDir: process.cwd(),
        ctxDir: process.cwd(),
        fs: fs,
        logger: logger,
        processController: new ProcessController(),
        mongoManager: new MongoManager().createMongoClient(config.mongodb, logger),
    });
}

main();