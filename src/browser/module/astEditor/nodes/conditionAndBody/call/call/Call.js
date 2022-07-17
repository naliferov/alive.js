import AstNode from "../../../AstNode.js";
import CallCondition from "./CallCondition.js";

export default class Call extends AstNode {

    condition;

    constructor() {
        super('', {className: 'call'});
        super.insert(new AstNode('('));
        this.condition = new CallCondition; super.insert(this.condition);
        super.insert(new AstNode(')'));
    }

    insertInCondition(node) { this.condition.insert(node); }
    isConditionEmpty() { return this.condition.getChildrenCount() < 1; }
    getFirstConditionPart() { return this.condition.getFirstChunk(); }

    serialize() {
        return {
            ...super.serialize(),
            condition: this.condition.serializeSubNodes(),
        };
    }

    insert(chunk) { this.condition.insert(chunk); }
}