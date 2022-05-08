import AstNode from "../../AstNode";
import ObjectKey from "./ObjectKey";
import ObjectValue from "./ObjectValue";

export default class ObjectItem extends AstNode {

    k: ObjectKey
    v: ObjectValue

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

    serialize(): object {
        return {
            t: this.constructor.name,
            k: this.k.serialize(),
            v: this.v.serialize(),
        }
    }
}