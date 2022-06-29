import AstNode from "./AstNode.js";

export default class ModuleBody extends AstNode {
    constructor() {
        super('', {className: 'mainFlow'});
    }
}