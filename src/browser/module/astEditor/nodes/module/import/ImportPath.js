import AstNode from "../../AstNode.js";

export default class ImportPath extends AstNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'ImportPath'});
    }
}