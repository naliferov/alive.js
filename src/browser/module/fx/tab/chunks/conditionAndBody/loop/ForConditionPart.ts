import BaseChunk from "../../BaseChunk";
import ForConditionPartInternal from "./ForConditionPartInternal";

export default class ForConditionPart extends BaseChunk {

    internal: ForConditionPartInternal;

    constructor() {
        super('', {className: 'forConditionPart'});

        this.internal = new ForConditionPartInternal();
        super.insert(this.internal);
        let closePart = new BaseChunk('; ');
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

    insert(chunk: BaseChunk) {
        this.internal.insert(chunk);
    }
}