import * as fs from 'fs';
import * as util from 'util';

export default class FS {

    readFileNative = util.promisify(fs.readFile);
    writeFileNative = util.promisify(fs.writeFile);
    renameNative = util.promisify(fs.rename);
    mkdir = util.promisify(fs.mkdir);
    open = util.promisify(fs.open);
    close = util.promisify(fs.close);

    async openFile(path, flags) {
        return await this.open(path, flags);
    }

    async closeFile(fd) {
        return await this.close(fd);
    }

    async readFile(path) { return await this.readFileNative(path, 'utf8'); }
    async writeFile(path, data) { return await this.writeFileNative(path, data); }

    async mv(oldPath, newPath) {
        return await this.renameNative(oldPath, newPath);
    }

    async exists(path) {
        return new Promise((resolve) => {
            fs.access(path, fs.constants.F_OK, (err) => resolve(!err))
        });
    }

    async mkDir(path) {
        return await this.mkdir(path);
    }

    async readDir(path) {
        return new Promise((resolve) => {
            fs.readdir(path, (err, files) => resolve(files));
        });
    }

    async rm(path) {
        return new Promise((resolve) => {
            fs.rm(path, (error) => resolve(error));
        });
    }

    rmSync(path) { fs.rmSync(path); }
}