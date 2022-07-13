import FS from "../../io/fs/FS";

export default class Process {

    path;
    execFileName;
    processName;
    exec;
    fs;

    constructor(path, processName) {
        this.processName = processName;
        this.fs = new FS;
    }

    getName() { return this.processName; }
    getExecFileName() { return this.execFileName; }

    async run(args, detach = false) {

        /*const pidsSet = fSet(PIDS_FILE);
        if (await pidsSet.r(args[0])) { console.log(`PID for [${args[0]}] exists.`); return; }

        let child = null;
        const filePath = `${PROCESS_JS_PATH}/${args[0]}`;*/

        console.log(`Run process [${args[0]}]. PID: [${process.pid}]. CliArgs:`, args);
        /*const exec = new OsExec('node', [filePath], process.cwd(), new Logger( 'exec: '));
        const resp = await exec.process((childCreated) => {
            child = childCreated; console.log('child PID', child.pid);
            pidsSet.w(args[0], child.pid);
        }, detach);
        console.log(`Stop process. Code: [${resp.code}].`);*/
    }
}