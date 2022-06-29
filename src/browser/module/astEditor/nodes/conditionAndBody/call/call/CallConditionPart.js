import AstNode from "../../../AstNode.js";
import CallConditionPartInternal from "./CallConditionPartInternal.js";

export default class CallConditionPart extends AstNode {

    internal;

    constructor() {
        super('', {className: 'conditionPart'});

        this.internal = new CallConditionPartInternal; super.insert(this.internal);
        super.insert(new AstNode(', '));
    }

    getInternal() { return this.internal; }
    serialize() {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }

    getLastChunk() { return this.internal.getLastChunk(); }
    insert(chunk) { this.internal.insert(chunk); }
}