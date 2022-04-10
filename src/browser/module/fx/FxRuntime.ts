import U from "../../core/U";
import Editor from "../txtEditor/Editor";
import Script from "../txtEditor/txt/scripts/Script";
import Button from "../../core/view/ui/Button";
import WSClient from "../../core/io/WSClient";
import Pubsub from "../../../io/pubsub/Pubsub";
import {
    CONSOLE_BTN_CLICK,
    KEYBOARD_BTN_CLICK,
    PROCESS_BTN_CLICK,
    SCRIPTS_BTN_CLICK
} from "../../../io/pubsub/PubsubConstants";
import MindFields from "../mindfields/MindFields";
import FxTabManager from "./tab/FxTabManager";

export default class FxRuntime {

    unit: U;

    mindFields: MindFields;
    wsClient: WSClient;
    pubsub: Pubsub;

    scripts: U;

    iphone: boolean = false;

    fxTabManager: FxTabManager;

    constructor(mindFields: MindFields, wsClient: WSClient, pubsub: Pubsub, fxTabManager: FxTabManager) {
        this.mindFields = mindFields;
        this.wsClient = wsClient;
        this.pubsub = pubsub;
        this.unit = new U({class: ['fxRuntimeContainer']});
        this.fxTabManager = fxTabManager;
    }

    onClick(fn) {
        this.unit.on('click', fn);
    }

    getUnit() {
        return this.unit;
    }

    async init(app: U) {
        app.in(this.unit);
        this.unit.in(this.fxTabManager.getUnit());

        //SENSOR CONTROLS
        /*const row = new V({class: ['row', 'flex']});
        mainBlock.insert(row);*/

        /*const circleMover = new CircleMover(console);
        const circleSwitcher = new CircleSwitcher();*/

        //circleSwitcher.setHandler((status) => status ? circleMover.enableHorizontalLock() : circleMover.disableHorizontalLock());
        //row.insert(circleSwitcher.getUnit());

        //circleMover.setShiftCursorHandler((key) => this.editor.triggerKeyPress(key));
        //row.insert(circleMover.getUnit());
    }

    async openTab(unit: U) { this.fxTabManager.openTab(unit); }

    async focusTab(unit: U) {
        const openedTab = this.fxTabManager.getTabByContextUnit(unit);
        if (!openedTab) return;
        this.fxTabManager.focusTab(openedTab);
    }

    async onKeyDown(e) {
        await this.fxTabManager.onKeyDown(e);
    }

    buildBtnsRow(app: U) {

        const btnsRow = new U({class: ['row']});
        app.insert(btnsRow);

        const scriptsBtn = new Button('scripts');
        scriptsBtn.on(this.iphone ? 'touchstart' : 'click', (e) => this.pubsub.pub(SCRIPTS_BTN_CLICK));
        btnsRow.insert(scriptsBtn.getUnit());

        const consoleBtn = new Button('console');
        consoleBtn.on(this.iphone ? 'touchstart' : 'click', (e) => this.pubsub.pub(CONSOLE_BTN_CLICK));
        btnsRow.insert(consoleBtn.getUnit());

        const processBtn = new Button('process');
        processBtn.on(this.iphone ? 'touchstart' : 'click', (e) => this.pubsub.pub(PROCESS_BTN_CLICK));
        btnsRow.insert(processBtn.getUnit());

        const keyboardBtn = new Button('keyboard');
        keyboardBtn.on(this.iphone ? 'touchstart' : 'click', (e) => this.pubsub.pub(KEYBOARD_BTN_CLICK));
        btnsRow.insert(keyboardBtn.getUnit());
    }

    execLogic() {
        const sys = {
            log: (obj) => {
                console.log(obj);
            }
        };

        // @ts-ignore
        /*const u = async (scriptName, args = null) => {
            const unit = unitsByNames[scriptName];
            if (!unit) console.log(`No script with name [${scriptName}].`);
            // @ts-ignore
            const fn = window.scripts[unit.getName()]
            return fn ? await fn(args, u, sys) : null;
        }

        // @ts-ignore
        window.scripts = {};
        let globalJs = '';

        const unitsByNames = this.state.getUnitsByNames();
        for (let unitName in unitsByNames) {
            const js = unitsByNames[unitName].getJs();
            globalJs += `window.scripts['${unitName}'] = async (msg, u, sys) => { ${js} \n } \n`;
        }

        const blob = new Blob([globalJs], {type: 'text/javascript'});
        const url = URL.createObjectURL(blob);
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => u('main');
        document.body.append(script);*/
    }

    /*setScriptsHeight(nav: V, scripts: V) {
        scripts.getDOM().style.minHeight = (window.innerHeight - nav.getSizesAbsolute().height) + 'px';
    }*/
}