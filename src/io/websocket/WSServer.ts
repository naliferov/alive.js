import HttpServer from "../http/HttpServer";
import { WebSocketServer } from 'ws';
import FS from "../fs/FS";
import StateManager from "../state/StateManager";
import {PROCESS_TEMPLATE_FILE} from "../../AppConstants";

export default class WSServer {

    constructor(httpServer: HttpServer, stateManager: StateManager, fs: FS) {

        const wss = new WebSocketServer({ server: httpServer.getServer() });

        wss.on('connection', (ws) => {

            ws.on('message', async (msg) => {
                console.log('WsMsg received.', msg.toString());
                ws.send(JSON.stringify({'': 'WsMsg received.'}));

                const m = JSON.parse(msg);
                if (m.runScript) {
                    const scriptName = m.runScript;
                    if (typeof m.runScript !== 'string') { console.log('scriptName is not string.'); return; }

                    let procTemplate = await fs.readFile(PROCESS_TEMPLATE_FILE); procTemplate += '\n\n';
                    const state = await stateManager.getState();
                    for (let i in state) procTemplate += `f['${state[i].name}'] = async(m) => {\n${state[i].js}\n}\n\n`;
                    procTemplate += `\n\n c('${scriptName}')`;

                    //await fs.writeFile(`${PROCESS_JS_PATH}/${scriptName}.js`, procTemplate);
                    //new Process(`${PROCESS_JS_PATH}/${scriptName}.js`, scriptName).run([scriptName], true);
                }
                if (m.streamProcessLog) {
                    /*logger.setHandler((msg) => {
                        console.log('log', msg);
                    });*/

                    //const exec = new OsExec(`tail`, ['-f', `./log/${m.scriptName}`], '', logger);
                    //exec.run();
                }
            });
        });
    }

    prepareScriptsFile() {

        //server is a script too
        let globalJs = 'let scripts = []';

        /*const unitsByNames = this.state.getUnitsByNames();
        for (let unitName in unitsByNames) {
            const js = unitsByNames[unitName].getJs();
            globalJs += `scripts['${unitName}'] = async (msg, u, sys) => { ${js} \n } \n`;
        }*/
    }
}

