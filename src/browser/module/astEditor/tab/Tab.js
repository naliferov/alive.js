import TabName from "./TabName.js";
import AstEditor from "../control/AstEditor.js";
import AstNodeEditor from "../control/AstNodeEditor.js";

export default class Tab {

    tabName;
    astEditor;

    contextNode;

    constructor(tabName, contextNode, fxSerializer, nodes) {
        this.tabName = new TabName(tabName, contextNode);
        this.astEditor = new AstEditor(
            contextNode, fxSerializer, new AstNodeEditor(), nodes
        );

        this.contextNode = contextNode;
    }

    getContextNodeId() { return this.contextNode.get('id'); }
    getTabName() { return this.tabName; }
    getAstEditor() { return this.astEditor; }

    activate() {
        this.tabName.activate();
        this.astEditor.show();
    }
    deactivate() {
        this.tabName.deactivate();
        this.astEditor.hide();
    }
    onClick(fn) { this.tabName.onTabClick(fn); }
    onClickClose(fn) { this.tabName.onTabCloseClick(fn); }
    close() {
        this.tabName.close();
        this.astEditor.close();
    }
}