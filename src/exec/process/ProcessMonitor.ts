import OsExec from "./OsExec";
import FS from "../../io/fs/FS";

export default class ProcessMonitor {

    path: string;
    execFileName: string;
    processName: string;
    exec: OsExec;
    fs: FS;
}