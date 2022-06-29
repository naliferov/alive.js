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

    insertInCondition(chunk) { this.condition.insert(chunk); }
    isConditionEmpty() { return this.condition.getChildrenCount() < 1; }

    serialize() {
        return {
            t: this.constructor.name,
            condition: this.condition.serializeSubChunks(),
        };
    }

    insert(chunk) { this.condition.insert(chunk); }
}