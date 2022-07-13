import AstSerializer from "../AstSerializer.js";
import Tab from "./Tab.js";
import V from "../../../../type/V.js";

export default class TabManager {

    v;
    tabsNamesBlock;
    tabsContentBlock;

    activeTab;
    tabs;

    localState;
    nodes;
    astSerializer;

    constructor(nodes, localState) {

        this.v = new V({class: 'tabManager'});

        this.tabsNamesBlock = new V({class: 'tabs'});
        e('>', [this.tabsNamesBlock, this.v]);
        this.tabsContentBlock = new V({class: 'tabsContent'});
        e('>', [this.tabsContentBlock, this.v]);

        this.nodes = nodes;

        this.tabs = new Map;
        this.astSerializer = new AstSerializer();
        this.localState = localState;
    }

    getTabByContextNode(node) { return this.tabs.get(node.get('id')); }

    openTab(node) {

        let openedTab = this.tabs.get(node.get('id'));
        if (openedTab && this.activeTab.getContextNodeId() === openedTab.getContextNodeId()) {
            return;
        }
        if (this.activeTab) this.activeTab.deactivate();

        if (openedTab) {
            openedTab.activate();
            this.activeTab = openedTab;
        } else {

            const newTab = new Tab(node.get('name'), node, this.astSerializer, this.nodes);
            newTab.onClick((e) => this.focusTab(node));
            newTab.onClickClose((e) => {
                e.stopPropagation();
                this.closeTab(newTab)
            });
            newTab.activate();

            e('>', [newTab.getTabName().getV(), this.tabsNamesBlock]);

            this.tabs.set(newTab.getContextNodeId(), newTab);

            this.activeTab = newTab;
            e('>', [this.activeTab.getAstEditor().getV(), this.tabsContentBlock]);
        }

        this.localState.openTab(this.activeTab.getContextNodeId());
        this.localState.setActiveTabId(this.activeTab.getContextNodeId());
    }

    focusTab(node) {
        const nodeId = node.get('id');
        const tab = this.tabs.get(nodeId);
        if (!tab) { console.log('tabId not found', nodeId); return; }

        if (this.activeTab) {
            if (this.activeTab.getContextNodeId() === tab.getContextNodeId()) {
                return;
            }
            this.activeTab.deactivate();
        }
        this.activeTab = tab;
        tab.activate();
        this.localState.setActiveTabId(tab.getContextNodeId());
    }

    ASTPrevVersion() {
        if (this.activeTab) this.activeTab.getAstEditor().switchASTToPrevVersion();
    }

    ASTNextVersion() {
        if (this.activeTab) this.activeTab.getAstEditor().switchASTToNextVersion();
    }

    closeTab(tab) {

        const contextUnitId = tab.getContextNodeId();
        const isActiveTab = this.activeTab && this.activeTab.getContextNodeId() === contextUnitId;

        if (isActiveTab) {
            for (let [_, tab] of this.tabs) {
                if (tab.getContextNodeId() === contextUnitId) continue;
                this.focusTab(tab.getContextNode());
                break;
            }
        }

        this.tabs.delete(contextUnitId);
        tab.close();

        this.localState.closeTab(contextUnitId);
    }

    async onKeyDown(e) {
        if (this.activeTab) this.activeTab.getAstEditor().onKeyDown(e);
    }

    getActiveTab() { return this.activeTab; }
    getV() { return this.v }
}