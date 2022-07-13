import AstNode from "../AstNode.js";

export default class ModuleCallableCondition extends AstNode {
    constructor() {
        super('', {className: 'moduleCallableCondition'});

        super.insert(new AstNode('('));
        this.body = new AstNode('', {className: 'moduleCallableConditionBody'}); super.insert(this.body);
        super.insert(new AstNode(')'));
    }

    getBody() { return this.body; }

    serialize() { return this.body.serializeSubNodes(); }
    insert(chunk) { this.body.insert(chunk); }
    isEmpty() { return this.body.isEmpty(); }
    clear() { this.body.clear(); }
}