import AstNode from "../../AstNode.js";
import Space from "../../Space.js";
import NewLine from "../../NewLine.js";
import ForCondition from "./ForCondition.js";
import ForBody from "./ForBody.js";

export default class For extends AstNode {

    condition;
    body;

    constructor() {
        super('', {className: ['for']});

        const forChunk = new AstNode('for', {className: ['keyword']});
        super.insert(forChunk);
        super.insert(new Space());

        let openBracket = new AstNode('(', {className: 'bracket'}); super.insert(openBracket);
        this.condition = new ForCondition(); super.insert(this.condition);
        let closeBracket = new AstNode(')', {className: 'bracket'}); super.insert(closeBracket);

        super.insert(new Space());
        openBracket = new AstNode('{'); super.insert(openBracket);
        super.insert(new NewLine());

        this.body = new ForBody(); super.insert(this.body);
        super.insert(new NewLine());
        closeBracket = new AstNode('}'); super.insert(closeBracket);
    }

    getFirstChunk() { return this.condition; }

    insertInCondition(chunk) { this.condition.insert(chunk); }
    isConditionEmpty() {
        return this.condition.getChildrenCount() < 1;
    }
    isBodyEmpty() {
        return this.body.getChildrenCount() < 1;
    }

    getCondition() { return this.condition; }
    getBody() { return this.body; }

    serialize() {
        return {
            ...super.serialize(),
            condition: this.condition.serializeSubNodes(),
            body: this.body.serializeSubNodes(),
        }
    }
}