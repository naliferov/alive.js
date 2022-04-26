import FS from "../io/fs/FS";
import {EOL} from "os";

export default class Logger {

    handler;
    prefix: string = '';
    fs: FS;
    logFile: any;

    constructor(fs: FS) {
        this.fs = fs;
    }

    setPrefix(prefix: string) {
        this.prefix = prefix;
    }

    setHandler(handler) { this.handler = handler; }

    async enableLoggingToFile(logFile: string) {
        this.logFile = await this.fs.openFile(logFile, 'a');
        await this.fs.writeFile(this.logFile, EOL)
    }

    async disableLoggingToFile() {
        await this.fs.closeFile(this.logFile)
    }

    async log(msg: string, object?: object) {

        //todo добавить время логирования, в F есть функция формирования времени
        const logMsg = this.prefix + msg;
        if (object) {
            console.log(logMsg, object);
            if (this.logFile) await this.fs.writeFile(this.logFile, logMsg + JSON.stringify(object) + EOL);
        } else {
            console.log(logMsg);
            if (this.logFile) await this.fs.writeFile(this.logFile, logMsg + EOL);
        }
    }

    async info(msg: string, object: object = null) {
        await this.log(msg, object);
    }

    async warning(msg: string, object: object = null) {
        await this.log(msg, object);
    }

    async error(msg: string, object: object = null) {
        await this.log(msg, object);
    }
}