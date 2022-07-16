import FS from "../../io/fs/FS.js";
import OsExec from "./OsExec.js";

export default class ProcessManager {

    constructor(logger) {
        this.fs = new FS;
        this.logger = logger;
    }

    async runProcess(js, appDir) {
        const file = appDir + '/process/index.js';
        await this.fs.writeFile(file, js);

        const cmd = new OsExec('node', [file], '', this.logger);
        await cmd.run();
    }
}