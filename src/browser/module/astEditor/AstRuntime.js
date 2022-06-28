import Node from "../../../type/Node";

export default class AstRuntime {

    unit;
    pubsub;
    fxTabManager;

    constructor(pubsub, fxTabManager) {
        this.pubsub = pubsub;
        this.unit = new Node({class: ['fxRuntimeContainer']});
        this.fxTabManager = fxTabManager;
    }
    init(app) {
        app.in(this.unit);
        this.unit.in(this.fxTabManager.getUnit());
    }

    onClick(fn) { this.unit.on('click', fn); }

    async openTab(unit) { this.fxTabManager.openTab(unit); }
    async focusTab(unit) {
        const openedTab = this.fxTabManager.getTabByContextUnit(unit);
        if (!openedTab) return;
        this.fxTabManager.focusTab(openedTab);
    }

    async onKeyDown(e) { await this.fxTabManager.onKeyDown(e); }
}