import TabName from "./TabName.js";
import AstEditor from "../control/AstEditor.js";
import AstNodeEditor from "../control/AstNodeEditor.js";

export default class Tab {

    fxTabName;
    astEditor;

    contextUnit;

    constructor(tabName, contextUnit, pubsub, fxSerializer, mindfields) {
        this.fxTabName = new TabName(tabName, contextUnit);
        this.astEditor = new AstEditor(
            contextUnit, pubsub, fxSerializer, new AstNodeEditor(pubsub), mindfields
        );

        this.contextUnit = contextUnit;
    }

    getContextUnitId() {
        return this.contextUnit.getId();
    }

    getTabName() { return this.fxTabName; }

    getFxController() { return this.astEditor; }

    activate() {
        this.fxTabName.activate();
        this.astEditor.show();
    }

    deactivate() {
        this.fxTabName.deactivate();
        this.astEditor.hide();
    }

    onClick(fn) {
        this.fxTabName.onTabClick(fn);
    }

    onClickClose(fn) {
        this.fxTabName.onTabCloseClick(fn);
    }

    close() {
        this.fxTabName.close();
        this.astEditor.close();
    }
}