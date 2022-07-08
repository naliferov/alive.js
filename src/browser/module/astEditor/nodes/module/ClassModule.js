import AstNode from "../AstNode.js";

export default class ClassModule extends AstNode {
    constructor() {
        super('', {className: 'classModule'});
    }
}