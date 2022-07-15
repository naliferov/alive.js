import {spawn, exec} from 'node:child_process';

export default class OsExec {

    cmd;
    args;

    process;

    constructor(cmd, args= [], cwd = '', logger) {
        this.cmd = cmd;
        this.args = args;
        this.cwd = cwd;
        this.logger = logger;
    }

    async run(detached = false, childCallback = null) {

        return new Promise((resolve) => {

            console.log('run', this.cmd, this.args);

            const proc = spawn(this.cmd, this.args, {cwd: this.cwd, detached});
            this.process = proc;
            //if (childCallback) childCallback(proc);

            proc.stdout.on('data', (data) => {
                this.logger.info(data.toString().trim())
            });
            proc.stderr.on('data', (data) => {
                this.logger.error(data.toString().trim())
            });
            proc.on('error', (err) => {
                console.log(err, 'err');
                resolve()
            });
            proc.on('close', (code) => {
                console.log('close', code);
                resolve({code})
            });
        });
    }

    async kill() { this.process.kill(); }
}