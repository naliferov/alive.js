import Logger from "../../log/Logger";
import FS from "../../io/FS";
import OsExec from "./OsExec";
import WebServerCmd from "../cmd/WebServerCmd";

export const cmdList = {
    'install': async (cliArgs, {fs, appDir, logger}: {fs: FS, appDir: string, logger: Logger}) => {
        const runStr = `node ${appDir}/x.js $@`;
        const shFile = `${appDir}/install/fx.sh`;
        await fs.writeFile(shFile, runStr);

        await (new OsExec('sudo', ['chmod', '+x', shFile], '', logger)).run();
        await (new OsExec('sudo', ['rm', '/usr/bin/astEditor'], '', logger)).run();
        await (new OsExec('sudo', ['ln', '-s', shFile, '/usr/bin/astEditor'], '', logger)).run();

        await logger.info('Installation complete.');
    },
    'webpack': async (cliArgs, {logger}) => {
        await (new OsExec('webpack', [], '', logger)).run();
    },
    'webServer': async (cliArgs, {logger, fs, stateManager, appDir}) => await new WebServerCmd().run(cliArgs.port ?? '8080', fs, logger, stateManager, appDir),
}