import {spawn} from 'child_process';

export default class OsExec {

    cmd;
    args;
    cwd;
    logger;

    process;

    constructor(cmd, args= [], cwd = '', logger) {
        this.cmd = cmd;
        this.args = args;
        this.cwd = cwd;
        this.logger = logger;
    }

    async run(detach = false, childCallback = null) {

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