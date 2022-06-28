import Node from "../../../../type/Node.js";

export default class Text {

    unit: Node;

    constructor(txt: string) {
        this.unit = new Node({text: txt});
    }

    getDOM() {
        return this.unit.getDOM();
    }

    getUnit() {
        return this.unit;
    }
}