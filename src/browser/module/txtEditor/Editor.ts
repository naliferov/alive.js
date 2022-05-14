import T from "../../../type/T";
import Tab from "./tabs/tab/Tab";

export default class Editor {

    activeTab: Tab;
    tabs: Map<string, Tab>;

    unit: T;
    tabsNames: T;
    tabsContent: T;

    closeTabHandler;
    makeTabActiveHandler;
    changeCursorPosHandler;

    constructor() {

        this.tabs = new Map<string, Tab>();

        this.unit = new T({class: ['tabs']});

        this.tabsNames = new T({id: 'tabsNames'});
        this.tabsContent = new T({class: ['tabsContent']});

        this.unit.insert(this.tabsNames);
        this.unit.insert(this.tabsContent);
    }

    toggleView() {
        this.unit.toggleView();
    }

    show() {
        this.unit.show();
    }

    hide() {
        this.unit.hide();
    }

    triggerKeyPress(key: string) {
        const activeTab = this.getActiveTab();
        if (!activeTab) return;
        activeTab.triggerKeyPress(key);
    }

    getActiveTab(): Tab|null {
        return this.activeTab;
    }

    onCloseTab(closeTabHandler) {
        this.closeTabHandler = closeTabHandler;
    }

    onMakeTabActive(makeTabActiveHandler) {
        this.makeTabActiveHandler = makeTabActiveHandler;
    }

    onChangeCursorPosition(changeCursorPosHandler) {
        this.changeCursorPosHandler = changeCursorPosHandler;
    }

    addTab(contextUnit: T, cursorPos = null) {

        if (this.tabs.get(contextUnit.getId())) {
            return;
        }

        let tab = new Tab(contextUnit);
        this.tabs.set(tab.getTabId(), tab);

        this.tabsNames.insert(tab.getTabName().getUnit());
        this.tabsContent.insert(tab.getTabContent().getUnit());

        const isActiveTab = (tab: Tab) => this.activeTab && this.activeTab.getTabId() === tab.getTabId();

        if (cursorPos) tab.setCursorPos(cursorPos);

        tab.getTabName().click(() => {

            if (isActiveTab(tab)) {
                return;
            }
            if (this.activeTab) this.activeTab.hideTab();

            this.activeTab = tab;
            this.activeTab.showTab();
            if (this.makeTabActiveHandler) this.makeTabActiveHandler(tab.getTabId());
        });
        tab.getTabName().clickOnClose(() => {

            if (this.closeTabHandler) this.closeTabHandler(tab.getTabId());

            if (isActiveTab(tab)) {
                this.activeTab = null;
            }
            this.tabs.delete(tab.getTabId());
            tab.remove();
            tab = null;

            for (const [_, tab] of this.tabs) {
                this.activeTab = tab;
                this.activeTab.showTab();
                break;
            }
        });
        tab.getTabContent().onChangeCursorPosition((pos) => {
            if (this.changeCursorPosHandler) this.changeCursorPosHandler(tab.getTabId(), pos);
        });
    }

    activateFirstTab() {
        for (const [_, tab] of this.tabs) {
            if (!this.activeTab) this.activateTab(tab);
            break;
        }
    }

    activateTabByTabId(tabId: string) {
        for (const [_, tab] of this.tabs) {
            if (tab.getTabId() !== tabId) continue;
            this.activateTab(tab);
        }
    }

    activateTab(tab: Tab) {
        if (this.activeTab) this.activeTab.hideTab();
        this.activeTab = tab;
        this.activeTab.showTab();
        if (this.makeTabActiveHandler) this.makeTabActiveHandler(tab.getTabId());
    }

    enableControlOnActiveTab() {
        this.activeTab.enableControl();
    }

    disableControlOnActiveTab() {
        this.activeTab.disableControl();
    }

    getUnit() {
        return this.unit;
    }
}