import AstNode from "../AstNode";

export default class ConditionAndBodyNode extends AstNode {

    condition;
    body;

    getFirstChunk() { return this.condition; }
    insertInCondition(chunk: AstNode) { this.condition.insert(chunk); }
    insertInBody(chunk: AstNode) { this.body.insert(chunk); }

    isConditionEmpty() { return this.condition.getChildrenCount() < 1; }
    isBodyEmpty() { return this.body.getChildrenCount() < 1; }

    getCondition() { return this.condition; }
    getBody() { return this.body; }

    serialize(): object {
        return {
            t: this.constructor.name,
            condition: this.condition.serializeSubChunks(),
            body: this.body.serializeSubChunks(),
        };
    }
}