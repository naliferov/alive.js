export default class LocalState {

    //todo доделать тут всё как положено для сохранения fxIdsl

    openedFx;
    marked;

    constructor() {
        const openedFxJSON = localStorage.getItem('openedTabs');
        this.openedFx = openedFxJSON ? JSON.parse(openedFxJSON) : {};

        const markedJSON = localStorage.getItem('marked');
        this.marked = markedJSON ? JSON.parse(markedJSON) : {};
    }

    setScriptPanelStatus(status) {
        localStorage.setItem('scriptsPanel', status ? '1': '');
    }

    isScriptsPanelEnabled() {
        return !!localStorage.getItem('scriptsPanel');
    }

    setKeyboardStatus(status) {
        localStorage.setItem('keyboard', status ? '1': '');
    }

    isKeyboardEnabled() {
        return !!localStorage.getItem('keyboard');
    }

    isTabOpened(unitId) {
        return this.openedFx[unitId];
    }

    openTab(nodeId) {
        this.openedFx[nodeId] = {};
        localStorage.setItem('openedTabs', JSON.stringify(this.openedFx));
    }

    getOpenedTabs() {
        const openedScriptsJSON = localStorage.getItem('openedTabs');
        return openedScriptsJSON ? JSON.parse(openedScriptsJSON) : {};
    }

    closeTab(nodeId) {
        delete this.openedFx[nodeId];
        localStorage.setItem('openedTabs', JSON.stringify(this.openedFx));
    }

    setActiveTabId(tabId) {
        localStorage.setItem('activeTabId', tabId);
    }

    getActiveTabId() {
        return localStorage.getItem('activeTabId');
    }

    deleteMarkedASTNodeId(tabId) {
        delete this.marked[tabId];
        localStorage.setItem('marked', JSON.stringify(this.marked));
    }

    setMarkedASTNodeId(nodeId, astNodeId) {
        this.marked[nodeId] = astNodeId;
        localStorage.setItem('marked', JSON.stringify(this.marked));
    }
    getMarkedASTNodeId(nodeId) { return this.marked[nodeId]; }
}