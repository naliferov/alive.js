import AstNode from "../AstNode.js";

export default class ModuleImports extends AstNode {
    constructor() {
        super('', {className: 'moduleImports'});
    }
}