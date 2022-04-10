import TabContent from "./TabContent";
import TabName from "./TabName";
import U from "../../../../../../core/U";
import State from "../../../../../mindfields/state/State";

export default class Tab {

    tabId: string;

    tabName: TabName;
    tabContent: TabContent;

    constructor(contextUnit: U) {

        this.tabId = contextUnit.getId();

        this.tabName = new TabName(this.tabId, contextUnit.getName());
        this.tabContent = new TabContent(this.tabId, contextUnit);
    }

    triggerKeyPress(key: string) {
        this.tabContent.triggerKeyPress(key);
    }

    setCursorPos(cursorPos) {
        this.tabContent.setCursorPos(cursorPos);
    }

    showTab() {
        this.tabName.markActive();
        this.tabContent.show();
        this.tabContent.enableControl();
        this.tabContent.codeLines.afterRender();
    }

    hideTab() {
        this.tabName.markInactive();
        this.tabContent.hide();
        this.tabContent.disableControl();
    }

    enableControl() {
        this.tabContent.enableControl();
    }

    disableControl() {
        this.tabContent.disableControl();
    }

    remove() {
        this.tabName.remove();
        this.tabContent.remove();

        this.tabName = null;
        this.tabContent = null;
    }

    getTabId() {
        return this.tabId;
    }

    getTabName() {
        return this.tabName;
    }

    getTabContent() {
        return this.tabContent;
    }
}