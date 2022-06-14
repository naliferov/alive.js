import T from "../../../../type/T";
import Pubsub from "../../../../io/pubsub/Pubsub";
import Nodes from "../../nodes/Nodes";
import AstSerializer from "../AstSerializer";
import LocalState from "../../../Localstate";
import Tab from "./Tab";

export default class TabManager {

    u: T;
    tabsNamesBlock: T;
    tabsContentBlock: T;

    activeTab: Tab;
    tabs: Map<string, Tab>;

    localState: LocalState;
    pubsub: Pubsub;
    mindFields: Nodes;
    fxSerializer: AstSerializer;

    constructor(pubsub: Pubsub, mindFields: Nodes, localState: LocalState) {

        this.u = new T({class: ['tabManager']});

        this.tabsNamesBlock = new T({class: ['tabs']});
        this.u.in(this.tabsNamesBlock);
        this.tabsContentBlock = new T({class: ['tabsContent']});
        this.u.in(this.tabsContentBlock);

        this.pubsub = pubsub;
        this.mindFields = mindFields;

        this.tabs = new Map<string, Tab>();
        this.fxSerializer = new AstSerializer();

        //todo возможно это должно быть в nodes, а nodes должен уметь сохранять некоторые
        this.localState = localState;
    }

    getTabByContextUnit(unit: T): Tab|null {
        return this.tabs.get(unit.getId());
    }

    openTab(unit: T) {

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

    focusTab(tab: Tab) {
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

    closeTab(tab: Tab) {

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

    getUnit() {
        return this.u;
    }
}