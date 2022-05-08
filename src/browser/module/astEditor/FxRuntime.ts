import T from "../../../T";
import Button from "../../core/view/ui/Button";
import Pubsub from "../../../io/pubsub/Pubsub";
import Nodes from "../graph/Nodes";
import TabManager from "./tab/TabManager";

export default class FxRuntime {

    unit: T;

    mindFields: Nodes;
    pubsub: Pubsub;

    iphone: boolean = false;

    fxTabManager: TabManager;

    constructor(mindFields: Nodes, pubsub: Pubsub, fxTabManager: TabManager) {
        this.mindFields = mindFields;
        this.pubsub = pubsub;
        this.unit = new T({class: ['fxRuntimeContainer']});
        this.fxTabManager = fxTabManager;

        const consoleBtn = new Button('console');
        //consoleBtn.on('click', (e) => this.pubsub.pub(CONSOLE_BTN_CLICK));
        //btnsRow.insert(consoleBtn.getUnit());
    }

    onClick(fn) {
        this.unit.on('click', fn);
    }

    getUnit() {
        return this.unit;
    }

    async init(app: T) {
        app.in(this.unit);
        this.unit.in(this.fxTabManager.getUnit());
    }

    async openTab(unit: T) { this.fxTabManager.openTab(unit); }

    async focusTab(unit: T) {
        const openedTab = this.fxTabManager.getTabByContextUnit(unit);
        if (!openedTab) return;
        this.fxTabManager.focusTab(openedTab);
    }

    async onKeyDown(e) {
        await this.fxTabManager.onKeyDown(e);
    }

    /*setScriptsHeight(nav: V, scripts: V) {
        scripts.getDOM().style.minHeight = (window.innerHeight - nav.getSizesAbsolute().height) + 'px';
    }*/
}