import T from "../../../../type/T";
import TabName from "./TabName";
import Pubsub from "../../../../io/pubsub/Pubsub";
import AstSerializer from "../AstSerializer";
import Nodes from "../../nodes/Nodes";
import AstEditor from "../control/AstEditor";
import AstNodeEditor from "../control/AstNodeEditor";

export default class Tab {

    fxTabName: TabName;
    fxController: AstEditor;

    contextUnit: T;

    constructor(tabName, contextUnit: T, pubsub: Pubsub, fxSerializer: AstSerializer, mindfields: Nodes) {
        this.fxTabName = new TabName(tabName, contextUnit);
        this.fxController = new AstEditor(
            contextUnit, pubsub, fxSerializer, new AstNodeEditor(pubsub), mindfields
        );

        this.contextUnit = contextUnit;
    }

    getContextUnitId(): string {
        return this.contextUnit.getId();
    }

    getTabName(): TabName {
        return this.fxTabName;
    }

    getFxController(): AstEditor {
        return this.fxController;
    }

    activate() {
        this.fxTabName.activate();
        this.fxController.show();
    }

    deactivate() {
        this.fxTabName.deactivate();
        this.fxController.hide();
    }

    onClick(fn) {
        this.fxTabName.onTabClick(fn);
    }

    onClickClose(fn) {
        this.fxTabName.onTabCloseClick(fn);
    }

    close() {
        this.fxTabName.close();
        this.fxController.close();
    }
}