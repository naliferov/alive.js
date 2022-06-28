import Node from "../../../../type/Node";
import E from "../../../../io/E";

export default class File {

    unit: Node;

    constructor(text: string) {

        this.unit = new Node({
            text: text
        });
    }

    getUnit() {
        return this.unit;
    }

    on(handlerType, callback) {
        this.unit.on(handlerType, callback);
    }
}