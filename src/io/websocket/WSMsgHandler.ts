import HttpServer from "../http/HttpServer";
import { WebSocketServer } from 'ws';
import FS from "../FS";
import StateManager from "../state/StateManager";
import Process from "../../exec/process/Process";
import OsExec from "../../exec/process/OsExec";
import Logger from "../../log/Logger";
import {PROCESS_JS_PATH, PROCESS_TEMPLATE_FILE} from "../../exec/ExecConstants";

export default class WSServer {

    constructor(httpServer: HttpServer, stateManager: StateManager, fs: FS) {

            /*const m = JSON.parse(msg);
            if (m.runScript) {
                const scriptName = m.runScript;              if (typeof m.runScript !== 'string') { console.log('scriptName is not string.'); return; }

                let procTemplate = await fs.readFile(PROCESS_TEMPLATE_FILE); procTemplate += '\n\n';
                const state = await stateManager.getState();
                for (let i in state) procTemplate += `f['${state[i].name}'] = async(m) => {\n${state[i].js}\n}\n\n`;
                procTemplate += `\n\n c('${scriptName}')`;

                await fs.writeFile(`${PROCESS_JS_PATH}/${scriptName}.js`, procTemplate);
                new Process(`${PROCESS_JS_PATH}/${scriptName}.js`, scriptName).run([scriptName], true);
            }
            if (m.streamProcessLog) {
                const logger = new Logger();
                logger.setHandler((msg) => {
                    console.log('log', msg);
                });
                //const exec = new OsExec(`tail`, ['-f', `./log/${m.scriptName}`], '', logger);
                //exec.run();
            }*/
    }
}
