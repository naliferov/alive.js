import OsExec from "./OsExec";
import Logger from "../../log/Logger";
import FS from "../../io/fs/FS";
import {fSet} from "../../F";

//Это тоже processControl, но для контроля запуска не текущего процесса, а запуска дочернего процесса.

export default class Process {

    path: string;
    execFileName: string;
    processName: string;
    exec: OsExec;
    fs: FS;

    constructor(path: string, processName: string) {
        this.processName = processName;
        this.fs = new FS;
    }

    getName(): string { return this.processName; }
    getExecFileName(): string { return this.execFileName; }

    async run(args: string[], detach = false) {

        /*const pidsSet = fSet(PIDS_FILE);
        if (await pidsSet.r(args[0])) { console.log(`PID for [${args[0]}] exists.`); return; }

        let child = null;
        const filePath = `${PROCESS_JS_PATH}/${args[0]}`;*/

        console.log(`Run process [${args[0]}]. PID: [${process.pid}]. CliArgs:`, args);
        /*const exec = new OsExec('node', [filePath], process.cwd(), new Logger( 'exec: '));
        const resp = await exec.run((childCreated) => {
            child = childCreated; console.log('child PID', child.pid);
            pidsSet.w(args[0], child.pid);
        }, detach);
        console.log(`Stop process. Code: [${resp.code}].`);*/
    }
}