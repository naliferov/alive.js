import BaseNode from "../../BaseNode";
import ObjectKey from "./ObjectKey";
import ObjectValue from "./ObjectValue";

export default class ObjectItem extends BaseNode {

    k: ObjectKey
    v: ObjectValue

    constructor() {
        super('', {className: 'objectItem'});
        this.k = new ObjectKey; super.insert(this.k);
        super.insert(new BaseNode(': ', {className: 'kvSeparator'}));
        this.v = new ObjectValue; super.insert(this.v);
        super.insert(new BaseNode(', ', {className: 'comma'}));
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