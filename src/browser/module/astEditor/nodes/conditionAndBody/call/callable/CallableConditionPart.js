import AstNode from "../../../AstNode.js";
import CallableConditionPartInternal from "./CallableConditionPartInternal.js";

export default class CallableConditionPart extends AstNode {

    internal;

    constructor() {
        super('', {className: 'conditionPart'});

        this.internal = new CallableConditionPartInternal;
        super.insert(this.internal);
        let closePart = new AstNode(', ');
        super.insert(closePart);
    }

    getInternal() { return this.internal; }
    serialize() {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubNodes(),
        };
    }

    getLastChunk() { return this.internal.getLastChunk(); }
    insert(chunk) { this.internal.insert(chunk); }
}