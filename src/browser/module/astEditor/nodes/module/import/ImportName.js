import AstNode from "../../AstNode.js";

export default class ImportName extends AstNode {
    constructor() {
        super('', {className: 'ImportName'});
    }
}