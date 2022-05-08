import T from "../../../../T";
import TabName from "./TabName";
import Pubsub from "../../../../io/pubsub/Pubsub";
import FxSerializer from "../FxSerializer";
import Nodes from "../../graph/Nodes";
import AstController from "../control/AstController";
import AstNodeEditor from "../control/AstNodeEditor";

export default class Tab {

    fxTabName: TabName;
    fxController: AstController;

    contextUnit: T;

    constructor(tabName, contextUnit: T, pubsub: Pubsub, fxSerializer: FxSerializer, mindfields: Nodes) {
        this.fxTabName = new TabName(tabName, contextUnit);
        this.fxController = new AstController(
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

    getFxController(): AstController {
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