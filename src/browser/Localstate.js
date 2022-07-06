export default class LocalState {

    //todo доделать тут всё как положено для сохранения fxIdsl

    openedFx;

    constructor() {
        const openedFxJSON = localStorage.getItem('openedTabs');
        this.openedFx = openedFxJSON ? JSON.parse(openedFxJSON) : {};
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

    getMarkedChunk(tabId) {
        const script = this.openedFx[tabId];
        if (script) {
            return script.cursorPos;
        }
    }
}