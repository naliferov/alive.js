import Nodes from "../../outliner/Nodes.js";
import AstSerializer from "../AstSerializer.js";
import Tab from "./Tab.js";
import V from "../../../../type/V.js";

export default class TabManager {

    u;
    tabsNamesBlock;
    tabsContentBlock;

    activeTab;
    tabs;

    localState;
    nodes;
    fxSerializer;

    constructor(nodes, localState) {

        this.u = new V({class: 'tabManager'});

        this.tabsNamesBlock = new V({class: 'tabs'});
        this.u.in(this.tabsNamesBlock);
        this.tabsContentBlock = new V({class: 'tabsContent'});
        this.u.in(this.tabsContentBlock);

        this.nodes = nodes;

        this.tabs = new Map;
        this.fxSerializer = new AstSerializer();
        this.localState = localState;
    }

    getTabByContextUnit(unit) {
        return this.tabs.get(unit.getId());
    }

    openTab(unit) {

        let openedTab = this.tabs.get(unit.getId());
        if (openedTab && this.activeTab.getContextUnitId() === openedTab.getContextUnitId()) {
            return;
        }
        if (this.activeTab) this.activeTab.deactivate();

        if (openedTab) {
            openedTab.activate();
            this.activeTab = openedTab;
        } else {

            let newTab = new Tab(unit.getName(), unit, this.pubsub, this.fxSerializer, this.mindFields);
            newTab.onClick((e) => this.focusTab(newTab));
            newTab.onClickClose((e) => {
                e.stopPropagation();
                this.closeTab(newTab)
            });
            newTab.activate();

            this.tabsNamesBlock.insert(newTab.getTabName().getUnit());
            this.tabs.set(newTab.getContextUnitId(), newTab);

            this.activeTab = newTab;
            this.tabsContentBlock.in(this.activeTab.getFxController().getUnit());
        }

        this.localState.openTab(this.activeTab.getContextUnitId());
        this.localState.setActiveTabId(this.activeTab.getContextUnitId());
    }

    focusTab(tab) {
        if (this.activeTab) {
            if (this.activeTab.getContextUnitId() === tab.getContextUnitId()) {
                return;
            }
            this.activeTab.deactivate();
        }
        this.activeTab = tab;
        tab.activate();
        this.localState.setActiveTabId(tab.getContextUnitId());
    }

    closeTab(tab) {

        const contextUnitId = tab.getContextUnitId();
        const isActiveTab = this.activeTab && this.activeTab.getContextUnitId() === contextUnitId;

        if (isActiveTab) {
            for (let [key, tab] of this.tabs) {

                if (tab.getContextUnitId() === contextUnitId) continue;
                this.focusTab(tab);
                break;
            }
        }

        this.tabs.delete(contextUnitId);
        tab.close();

        this.localState.closeTab(contextUnitId);
    }

    async onKeyDown(e) {
        if (this.activeTab) this.activeTab.getFxController().onKeyDown(e);
    }
    getUnit() { return this.u }
}