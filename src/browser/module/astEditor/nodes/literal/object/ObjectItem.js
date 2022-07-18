import AstNode from "../../AstNode.js";
import ObjectKey from "./ObjectKey.js";
import ObjectValue from "./ObjectValue.js";

export default class ObjectItem extends AstNode {

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'objectItem'});
        this.key = new ObjectKey; super.insert(this.key);
        super.insert(new AstNode(': ', {className: 'kvSeparator'}));
        this.value = new ObjectValue; super.insert(this.value);
        super.insert(new AstNode(', ', {className: 'comma'}));
    }

    getKey() { return this.key; }
    getValue() { return this.value; }

    serialize() {
        return {
            ...super.serialize(),
            k: this.key.serialize(),
            v: this.value.serialize(),
        }
    }
}