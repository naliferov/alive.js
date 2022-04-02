import BaseChunk from "../../../BaseChunk";
import CallableConditionPartInternal from "./ConditionPartInternal";

export default class CallableConditionPart extends BaseChunk {

    internal: CallableConditionPartInternal;

    constructor() {
        super('', {className: 'conditionPart'});

        this.internal = new CallableConditionPartInternal;
        super.insert(this.internal);
        let closePart = new BaseChunk(', ');
        super.insert(closePart);
    }

    getInternal() { return this.internal; }
    serialize(): object {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }

    getLastChunk() { return this.internal.getLastChunk(); }
    insert(chunk: BaseChunk) { this.internal.insert(chunk); }
}