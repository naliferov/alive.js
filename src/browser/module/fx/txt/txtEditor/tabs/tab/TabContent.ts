import U from "../../../../../../core/U";
import CodeLines from "./editor/CodeLines";
import State from "../../../../../mindfields/state/State";

export default class TabContent {

    unit: U;
    codeLines: CodeLines;

    constructor(tabId, context: U) {
        this.unit = new U({class: ['tabContent']});
        this.unit.hide();
        this.unit.setAttr('tid', tabId);

        this.codeLines = new CodeLines(context);
        this.unit.insert(this.codeLines.getUnit());
    }

    triggerKeyPress(key: string) {
        this.codeLines.triggerKeyPress(key);
    }

    setCursorPos(cursorPos) {
        this.codeLines.setCursorPos(cursorPos);
    }

    show() {
        this.unit.show();
    }

    hide() {
        this.unit.hide();
    }

    remove() {
        this.unit.removeFromDom();
    }

    enableControl() {
        this.codeLines.enableControl();
    }

    disableControl() {
        this.codeLines.disableControl();
    }

    onChangeCursorPosition(handler) { this.codeLines.onChangeCursorPosition(handler); }

    getId() {
        return this.unit.getId();
    }

    getUnit() {
        return this.unit;
    }
}