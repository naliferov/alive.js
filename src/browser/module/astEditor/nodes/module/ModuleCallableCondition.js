import AstNode from "../AstNode.js";

export default class ModuleCallableCondition extends AstNode {
    constructor() {
        super('', {className: 'moduleCallableCondition'});
    }
}