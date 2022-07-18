import AstNode from "../../../AstNode.js";
import CallConditionPartInternal from "./CallConditionPartInternal.js";

export default class CallConditionPart extends AstNode {

    internal;

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'callConditionPart'});

        this.internal = new CallConditionPartInternal; super.insert(this.internal);
        super.insert(new AstNode(', '));
    }

    getInternal() { return this.internal; }
    serialize() {
        return {
            ...super.serialize(),
            internal: this.internal.serializeSubNodes(),
        };
    }

    getLastChunk() { return this.internal.getLastChunk(); }
    insert(chunk) { this.internal.insert(chunk); }
}