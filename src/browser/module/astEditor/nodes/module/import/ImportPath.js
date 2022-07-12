import AstNode from "../../AstNode.js";

export default class ImportPath extends AstNode {
    constructor() {
        super('', {className: 'ImportPath'});
    }
}