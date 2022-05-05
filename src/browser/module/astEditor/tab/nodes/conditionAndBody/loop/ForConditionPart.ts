import BaseNode from "../../BaseNode";
import ForConditionPartInternal from "./ForConditionPartInternal";

export default class ForConditionPart extends BaseNode {

    internal: ForConditionPartInternal;

    constructor() {
        super('', {className: 'forConditionPart'});

        this.internal = new ForConditionPartInternal();
        super.insert(this.internal);
        let closePart = new BaseNode('; ');
        super.insert(closePart);
    }

    getInternal() {
        return this.internal;
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }

    getLastChunk() {
        return this.internal.getLastChunk();
    }

    insert(chunk: BaseNode) {
        this.internal.insert(chunk);
    }
}