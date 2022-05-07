import AstNode from "../../AstNode";
import Space from "../../Space";
import NewLine from "../../NewLine";
import ForCondition from "./ForCondition";
import ForBody from "./ForBody";

export default class For extends AstNode {

    condition: ForCondition;
    body: ForBody;

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

    insertInCondition(chunk: AstNode) { this.condition.insert(chunk); }
    isConditionEmpty() {
        return this.condition.getChildrenCount() < 1;
    }
    isBodyEmpty() {
        return this.body.getChildrenCount() < 1;
    }

    getCondition() { return this.condition; }
    getBody() { return this.body; }

    serialize(): object {
        return {
            t: this.constructor.name,
            condition: this.condition.serializeSubChunks(),
            body: this.body.serializeSubChunks(),
        }
    }
}