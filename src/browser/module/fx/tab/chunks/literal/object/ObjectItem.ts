import BaseChunk from "../../BaseChunk";
import ObjectKey from "./ObjectKey";
import ObjectValue from "./ObjectValue";

export default class ObjectItem extends BaseChunk {

    k: ObjectKey
    v: ObjectValue

    constructor() {
        super('', {className: 'objectItem'});
        this.k = new ObjectKey; super.insert(this.k);
        super.insert(new BaseChunk(':', {className: 'kvSeparator'}));
        this.v = new ObjectValue; super.insert(this.v);
        super.insert(new BaseChunk(','));
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
            k: this.k.serializeSubChunks(),
            v: this.v.serializeSubChunks(),
        }
    }
}