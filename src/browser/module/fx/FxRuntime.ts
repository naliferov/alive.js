import U from "../../core/U";
import Editor from "./txt/txtEditor/Editor";
import Script from "./txt/scripts/Script";
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
import FxTabManager from "./fxRuntime/tab/FxTabManager";

export default class FxRuntime {

    unit: U;

    mindFields: MindFields;
    wsClient: WSClient;
    pubsub: Pubsub;

    scripts: U;
    editor: Editor;

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

        /*const console = new Console(100);
        const processList = new ProcessList(this.wsClient, this.pubsub);
        const scripts = new U({id: 'scripts', style: {background: 'rgb(243, 243, 243)'}});
        this.editor = new Editor();
        const keyboard = new Keyboard(console);*/

        //this.buildBtnsRow(app);

        /*if (!this.localState.isScriptsPanelEnabled()) scripts.hide();
        this.scripts = scripts;
        let row = new U({class: ['row']}); //app.insert(row);
        row.insert(scripts);
        this.pubsub.sub(SCRIPTS_BTN_CLICK, () => {
            scripts.toggleView();
            this.localState.setScriptPanelStatus(scripts.isShowed());
        });*/

        //const runInNodeBtn = new Button('run in node');
        //runInNodeBtn.on('click', async () => this.editor.getActiveTab() ? await this.wsClient.send({runScript: this.editor.getActiveTab().getTabName().getName()}) :'');
        //row = new U({class: ['row']}); //app.insert(row);
        //row.insert(runInNodeBtn.getUnit());

        //this.editor.onMakeTabActive((tabId) => localStorage.setItem('activeTabId', tabId));
        //this.editor.onCloseTab((tabId) => this.localState.closeScript(tabId));
        //this.editor.onChangeCursorPosition((tabId, position) => this.localState.setCursorPos(tabId, position));

        //app.insert(this.editor.getUnit());


        //this.renderScriptsAndTabs(scripts);
        //this.execLogic();

        //await processList.init();
        //app.insert(processList.getUnit());
        //this.pubsub.sub(PROCESS_BTN_CLICK, () => processList.getUnit().toggleView());

        //console.getUnit().hide();
        //app.insert(console.getUnit());
        //this.pubsub.sub(SCRIPTS_BTN_CLICK, () => console.getUnit().toggleView());

        //row = new U({class: ['row'], txt: 'Devices List'}); //app.insert(row);

        /*if (!this.localState.isKeyboardEnabled()) keyboard.getUnit().hide();
        keyboard.onKeyDownHandler((key) => this.editor.triggerKeyPress(key));
        app.insert(keyboard.getUnit());
        this.pubsub.sub(KEYBOARD_BTN_CLICK, () => {
            keyboard.getUnit().toggleView();
            this.localState.setKeyboardStatus(keyboard.getUnit().isShowed());
        });*/

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

    async buildFx() {


        /*const nameChunk = new Name('name');
        nameChunk.toggleLetDisplay();
        fx.addChunk(nameChunk);
        fx.addChunk(new Op('='));

        fx.addChunk(new Literal("'Leon'", 'string'));
        fx.addChunk(new Op('+'));
        fx.addChunk(new Literal('1.22', 'number'));
        fx.addChunk(new Op('-'));
        fx.addChunk(new Literal('38', 'number'));

        fx.addChunk(new NewLine());
        fx.addChunk(new NewLine());

        const name = new Name('console');
        fx.addChunk(name);
        fx.addChunk(new NameOfProp('log'));
        //fxRuntime.addChunk(new NameOfDynProp('log'));

        const call = new Call();
        fx.addChunk(call);

        fx.addChunk(new NewLine());
        fx.addChunk(new For());
        fx.addChunk(new NewLine());
        fx.addChunk(new NewLine());
        fx.addChunk(new If());

        fx.addChunk(new NewLine());
        fx.addChunk(new NewLine());

        const nameChunk2 = new Name('fn1');
        nameChunk2.toggleLetDisplay();

        fx.addChunk(nameChunk2);
        fx.addChunk(new Op('='));
        fx.addChunk(new Callable());*/
    }

    async openTab(unit: U) { this.fxTabManager.openTab(unit); }

    async focusTab(unit: U) {
        const openedTab = this.fxTabManager.getTabByContextUnit(unit);
        if (!openedTab) return;
        this.fxTabManager.focusTab(openedTab);
    }

    async onFocus() {

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

    renderScriptsAndTabs(scripts: U) {

        /*scripts.clear();

        const unitsByNames = this.mindFields.getUnitsByNames();
        const sortedNames = Object.keys(unitsByNames).sort();

        for (let i = 0; i < sortedNames.length; i++) {
            const unit = unitsByNames[ sortedNames[i] ];

            const script = new Script(unit);
            script.click(() => {
                this.editor.addTab(unit);
                this.editor.activateTabByTabId(unit.getId());
            });
            script.clickCopy(async (e) => {
                e.stopPropagation();
                console.log('copy');
                //await this.state.copy(unit.getId());
                //await this.state.save();

                //this.renderScriptsAndTabs(scripts);
            });
            script.clickEdit(async (e) => {
                e.stopPropagation();
                this.editor.disableControlOnActiveTab();

                script.enableNameEdit(async (newName) => {
                    if (!newName) return;
                    script.getContextUnit().setName(newName);
                    //await this.state.save();
                    this.editor.enableControlOnActiveTab();
                });
            });
            script.clickDelete(async (e) => {
                e.stopPropagation();
                this.editor.disableControlOnActiveTab();
                //await this.state.deleteUnit(unit.getId());
                //await this.state.save();
                //switch to another tab
            });

            scripts.insert(script.getUnit());
        }*/

        /*const activeTabId = this.localState.getActiveTabId();
        if (!activeTabId) {
            this.editor.activateFirstTab();
            return;
        }
        if (!this.localState.isTabOpened(activeTabId)) {
            this.editor.activateFirstTab();
            return;
        }
        this.editor.activateTabByTabId(activeTabId);*/
    }
}