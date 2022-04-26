import FS from "../fs/FS";
import {STATE_FILE_PATH} from "../../AppConstants";

export default class StateManager {
    fs: FS;
    path: string;

    constructor(fs: FS) { this.fs = fs; }
    async getState() { return JSON.parse(await this.fs.readFile(STATE_FILE_PATH)); }
    setState() {}
}