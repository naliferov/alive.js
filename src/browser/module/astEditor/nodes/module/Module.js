import AstNode from "../AstNode.js";

export default class Module extends AstNode {
    constructor() {
        super('', {className: 'module'});
    }
}