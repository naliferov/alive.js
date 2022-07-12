import AstNode from "../AstNode.js";

export default class ModuleCallableCondition extends AstNode {
    constructor() {
        super('', {className: 'moduleCallableCondition'});

        let openBracket = new AstNode('('); super.insert(openBracket);
        this.body = new AstNode('', {className: 'moduleCallableConditionBody'}); super.insert(this.body);
        let closeBracket = new AstNode(')');  super.insert(closeBracket);
    }

    getBody() { return this.body; }

    serialize() { return this.body.serializeSubNodes(); }
    insert(chunk) { this.body.insert(chunk); }
    isEmpty() { return this.body.isEmpty(); }
    clear() { this.body.clear(); }
}