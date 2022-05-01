import * as fs from 'fs';

console.log(fs);

let f = {
    fs: import('fs'),
    exec: async (m) => {
        const {spawn} = require('child_process');
        return new Promise((resolve) => {

            const ls = spawn(m.cmd, m.args, {cwd: m.cwd});
            console.log('child pid', ls.pid, ls.ppid);

            ls.stdout.on('data', (data) => {
                //stdoutBuffer.push(data.toString().trim());
                console.log(data.toString().trim());
            });
            ls.stderr.on('data', (data) => {
                //stderrBuffer.push(data.toString().trim());
                console.log(`E: ${data.toString().trim()}`);
            });
            ls.on('close', (code) => resolve({code}));
        });
    },
    log: (obj) => console.log(obj),
};

//const c = async (name, m = null) => await f[name](m);

