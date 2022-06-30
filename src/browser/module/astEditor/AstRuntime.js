import V from "../../../type/V.js";

export default class AstRuntime {

    v;
    tabManager;

    constructor(tabManager) {
        this.v = new V({class: 'runtimeContainer'});
        this.tabManager = tabManager;
    }

    init() { e('>', [this.tabManager.getV(), this.v]); }
    onClick(fn) { this.v.on('click', fn); }

    async openTab(unit) { this.tabManager.openTab(unit); }
    async focusTab(unit) {
        const openedTab = this.tabManager.getTabByContextUnit(unit);
        if (!openedTab) return;
        this.tabManager.focusTab(openedTab);
    }

    async onKeyDown(e) { await this.tabManager.onKeyDown(e); }

    getV() { return this.v; }
}