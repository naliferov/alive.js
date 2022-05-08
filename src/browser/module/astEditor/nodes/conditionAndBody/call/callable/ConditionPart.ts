import AstNode from "../../../AstNode";
import CallableConditionPartInternal from "./ConditionPartInternal";

export default class CallableConditionPart extends AstNode {

    internal: CallableConditionPartInternal;

    constructor() {
        super('', {className: 'conditionPart'});

        this.internal = new CallableConditionPartInternal;
        super.insert(this.internal);
        let closePart = new AstNode(', ');
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
    insert(chunk: AstNode) { this.internal.insert(chunk); }
}