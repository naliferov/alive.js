import AstNode from "../../AstNode.js";

export default class ImportName extends AstNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'ImportName'});
    }
}