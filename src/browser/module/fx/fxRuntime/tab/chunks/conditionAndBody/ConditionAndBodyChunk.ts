import BaseChunk from "../BaseChunk";

export default class ConditionAndBodyChunk extends BaseChunk {

    condition;
    body;

    getFirstChunk() { return this.condition; }
    insertInCondition(chunk: BaseChunk) { this.condition.insert(chunk); }
    insertInBody(chunk: BaseChunk) { this.body.insert(chunk); }

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