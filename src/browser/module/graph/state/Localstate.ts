export default class LocalState {

    //todo доделать тут всё как положено для сохранения fxIdsl

    openedFx: {};

    constructor() {
        const openedFxJSON = localStorage.getItem('openedTabs');
        this.openedFx = openedFxJSON ? JSON.parse(openedFxJSON) : {};
    }

    setScriptPanelStatus(status: boolean) {
        localStorage.setItem('scriptsPanel', status ? '1': '');
    }

    isScriptsPanelEnabled(): boolean {
        return !!localStorage.getItem('scriptsPanel');
    }

    setKeyboardStatus(status: boolean) {
        localStorage.setItem('keyboard', status ? '1': '');
    }

    isKeyboardEnabled(): boolean {
        return !!localStorage.getItem('keyboard');
    }

    isTabOpened(unitId: string) {
        return this.openedFx[unitId];
    }

    openTab(unitId: string) {
        this.openedFx[unitId] = {};
        localStorage.setItem('openedTabs', JSON.stringify(this.openedFx));
    }

    getOpenedTabs() {
        const openedScriptsJSON = localStorage.getItem('openedTabs');
        return openedScriptsJSON ? JSON.parse(openedScriptsJSON) : {};
    }

    closeTab(unitId: string) {
        delete this.openedFx[unitId];
        localStorage.setItem('openedTabs', JSON.stringify(this.openedFx));
    }

    setActiveTabId(tabId: string) {
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