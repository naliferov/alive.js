import FS from "../../io/fs/FS.js";
import OsExec from "./OsExec.js";

export default class ProcessManager {

    constructor() { this.fs = new FS; }

    async runProcess(js, appDir) {
        const file = appDir + '/process/index.js';
        await this.fs.writeFile(file, js);
        const cmd = new OsExec('node', [file]);
        await cmd.run();
    }
}