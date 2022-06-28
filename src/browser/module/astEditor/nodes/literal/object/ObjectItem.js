import AstNode from "../../AstNode.js";
import ObjectKey from "./ObjectKey.js";
import ObjectValue from "./ObjectValue.js";

export default class ObjectItem extends AstNode {

    k
    v

    constructor() {
        super('', {className: 'objectItem'});
        this.k = new ObjectKey; super.insert(this.k);
        super.insert(new AstNode(': ', {className: 'kvSeparator'}));
        this.v = new ObjectValue; super.insert(this.v);
        super.insert(new AstNode(', ', {className: 'comma'}));
    }

    getKey() {
        return this.k;
    }

    getValue() {
        return this.v;
    }

    serialize() {
        return {
            t: this.constructor.name,
            k: this.k.serialize(),
            v: this.v.serialize(),
        }
    }
}