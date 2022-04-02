import {Config, NodeSSH, SSHExecOptions} from "node-ssh";

export default class SSH {

    client: NodeSSH;
    config: Config;

    constructor(config: Config) {
        this.client = new NodeSSH();
        this.config = config;
    }

    async connect() {
        await this.client.connect(this.config);
    }

    async disconnect() {
        await this.client.dispose();
    }

    async exec(cmd: string, params: string[] = [], options: SSHExecOptions & { stream?: 'stdout' | 'stderr' } = {
        stream: 'stdout',
        execOptions: {}
    }) {
        if (!options.execOptions) {
            options.execOptions = {};
        }
        options.execOptions.pty = true;
        options.onStdout = (chunk) => {
            if (!chunk.toString().trim()) {
                return;
            }
            console.log(chunk.toString().trim())
        };
        options.onStderr = (chunk) => {
            if (!chunk.toString().trim()) {
                return;
            }
            console.log(chunk.toString().trim())
        };

        return await this.client.exec(cmd, params, options);
    }
}