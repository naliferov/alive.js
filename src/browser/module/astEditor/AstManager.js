import V from "../../../type/V.js";

export default class AstManager {

    v;
    tabManager;

    constructor(tabManager) {
        this.v = new V({class: 'astContainer'});
        this.tabManager = tabManager;
    }
    onClick(fn) { this.v.on('click', fn); }

    async openTab(node) { this.tabManager.openTab(node); }
    async focusTab(node) {
        const openedTab = this.tabManager.getTabByContextUnit(node);
        if (!openedTab) return;
        this.tabManager.focusTab(openedTab);
    }

    async onKeyDown(e) { await this.tabManager.onKeyDown(e); }

    getV() { return this.v; }
}