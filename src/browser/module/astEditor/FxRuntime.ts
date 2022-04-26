import U from "../../core/U";
import Button from "../../core/view/ui/Button";
import Pubsub from "../../../io/pubsub/Pubsub";
import Fields from "../outliner/Fields";
import FxTabManager from "./tab/FxTabManager";

export default class FxRuntime {

    unit: U;

    mindFields: Fields;
    pubsub: Pubsub;

    iphone: boolean = false;

    fxTabManager: FxTabManager;

    constructor(mindFields: Fields, pubsub: Pubsub, fxTabManager: FxTabManager) {
        this.mindFields = mindFields;
        this.pubsub = pubsub;
        this.unit = new U({class: ['fxRuntimeContainer']});
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

    async init(app: U) {
        app.in(this.unit);
        this.unit.in(this.fxTabManager.getUnit());
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

    /*setScriptsHeight(nav: V, scripts: V) {
        scripts.getDOM().style.minHeight = (window.innerHeight - nav.getSizesAbsolute().height) + 'px';
    }*/
}