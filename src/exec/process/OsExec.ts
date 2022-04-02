import {spawn, ChildProcess} from 'child_process';
import Logger from "../../log/Logger";
import {ExecResult} from "./types/ExecTypes";

export default class OsExec {

    cmd: string;
    args: string[];
    cwd: string;
    logger: Logger;

    process: ChildProcess;

    constructor(cmd: string, args: string[] = [], cwd: string = '', logger: Logger) {
        this.cmd = cmd;
        this.args = args;
        this.cwd = cwd;
        this.logger = logger;
    }

    async run(childCallback = null, detach = false): Promise<ExecResult> {

        return new Promise((resolve) => {
            const proc = spawn(this.cmd, this.args, {cwd: this.cwd, detached: detach});
            this.process = proc;

            if (childCallback) childCallback(proc);

            proc.stdout.on('data', (data) => this.logger.info(data.toString().trim()));
            proc.stderr.on('data', (data) => this.logger.error(data.toString().trim()));
            proc.on('close', (code) => resolve({code}));
        });
    }

    async kill() { this.process.kill(); }
}