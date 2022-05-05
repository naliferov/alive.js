import BaseNode from "../../../BaseNode";
import CallableConditionPartInternal from "./CallArgInternal";

export default class CallConditionPart extends BaseNode {

    internal: CallableConditionPartInternal;

    constructor() {
        super('', {className: 'conditionPart'});

        this.internal = new CallableConditionPartInternal;
        super.insert(this.internal);
        let closePart = new BaseNode(', ');
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
    insert(chunk: BaseNode) { this.internal.insert(chunk); }
}