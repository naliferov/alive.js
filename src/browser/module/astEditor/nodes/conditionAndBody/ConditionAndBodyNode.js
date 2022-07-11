import AstNode from "../AstNode.js";

export default class ConditionAndBodyNode extends AstNode {

    condition;
    body;

    getFirstChunk() { return this.condition; }
    insertInCondition(chunk) { this.condition.insert(chunk); }
    insertInBody(chunk) { this.body.insert(chunk); }

    isConditionEmpty() { return this.condition.getChildrenCount() < 1; }
    isBodyEmpty() { return this.body.getChildrenCount() < 1; }

    getCondition() { return this.condition; }
    getBody() { return this.body; }

    serialize() {
        return {
            t: this.constructor.name,
            condition: this.condition.serializeSubNodes(),
            body: this.body.serializeSubNodes(),
        };
    }
}