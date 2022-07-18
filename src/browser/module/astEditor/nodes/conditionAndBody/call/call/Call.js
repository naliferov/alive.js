import AstNode from "../../../AstNode.js";
import CallCondition from "./CallCondition.js";

export default class Call extends AstNode {

    condition;

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'call'});

        super.insert(new AstNode('('));
        this.condition = new CallCondition('', {id: options.conditionId});
        super.insert(this.condition);
        super.insert(new AstNode(')'));
    }

    insertInCondition(node) { this.condition.insert(node); }
    isConditionEmpty() { return this.condition.getChildrenCount() < 1; }
    getFirstConditionPart() { return this.condition.getFirstChunk(); }

    //setConditionId(id) { this.condition.setId(id); }

    serialize() {
        return {
            ...super.serialize(),
            condition: this.condition.serializeSubNodes(),
            conditionId: this.condition.getId(),
        };
    }

    insert(chunk) { this.condition.insert(chunk); }
}