import U from "../../../core/U";
import Pubsub from "../../../../io/pubsub/Pubsub";
import MindFields from "../../mindfields/MindFields";
import FxSerializer from "../FxSerializer";
import LocalState from "../../mindfields/state/Localstate";
import FxTab from "./FxTab";

export default class FxTabManager {

    u: U;
    tabsNamesBlock: U;
    tabsContentBlock: U;

    activeTab: FxTab;
    tabs: Map<string, FxTab>; //key is contextUnitId

    localState: LocalState;
    pubsub: Pubsub;
    mindFields: MindFields;
    fxSerializer: FxSerializer;

    constructor(pubsub: Pubsub, mindFields: MindFields, localState: LocalState) {

        this.u = new U({class: ['tabManager']});

        this.tabsNamesBlock = new U({class: ['tabs']});
        this.u.in(this.tabsNamesBlock);
        this.tabsContentBlock = new U({class: ['tabsContent']});
        this.u.in(this.tabsContentBlock);

        this.pubsub = pubsub;
        this.mindFields = mindFields;

        this.tabs = new Map<string, FxTab>();
        this.fxSerializer = new FxSerializer();

        //todo возможно это должно быть в mindfields, а mindfields должен уметь сохранять некоторые
        this.localState = localState;
    }

    openTab(unit: U) {

        let openedTab = this.tabs.get(unit.getId());
        if (openedTab && this.activeTab.getContextUnitId() === openedTab.getContextUnitId()) {
            return;
        }

        if (this.activeTab) this.activeTab.deactivate();

        if (openedTab) {
            openedTab.activate();
            this.activeTab = openedTab;
        } else {
            let newTab = new FxTab(unit.getTxt(), unit, this.pubsub, this.fxSerializer, this.mindFields);
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
    }

    getTabByContextUnit(unit: U): FxTab|null {
        return this.tabs.get(unit.getId());
    }

    focusTab(tab: FxTab) {

        if (this.activeTab) {
            if (this.activeTab.getContextUnitId() === tab.getContextUnitId()) {
                return;
            }
            this.activeTab.deactivate();
        }

        this.activeTab = tab;
        this.activeTab.activate();
        this.localState.setActiveTabId(this.activeTab.getContextUnitId());
    }

    closeTab(tab: FxTab) {

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