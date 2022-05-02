import T from "../../../../T";
import FxTabName from "./FxTabName";
import Pubsub from "../../../../io/pubsub/Pubsub";
import FxSerializer from "../FxSerializer";
import Nodes from "../../graph/Nodes";
import FxController from "../control/FxController";
import FxMutatorFactory from "../control/FxMutatorFactory";

export default class FxTab {

    fxTabName: FxTabName;
    fxController: FxController;

    contextUnit: T;

    constructor(tabName, contextUnit: T, pubsub: Pubsub, fxSerializer: FxSerializer, mindfields: Nodes) {
        this.fxTabName = new FxTabName(tabName, contextUnit);
        this.fxController = new FxController(
            contextUnit, pubsub, fxSerializer, new FxMutatorFactory(pubsub), mindfields
        );

        this.contextUnit = contextUnit;
    }

    getContextUnitId(): string {
        return this.contextUnit.getId();
    }

    getTabName(): FxTabName {
        return this.fxTabName;
    }

    getFxController(): FxController {
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