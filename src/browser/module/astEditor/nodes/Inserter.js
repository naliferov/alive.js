import AstNode from "./AstNode.js";

export default class Inserter extends AstNode {
    constructor() {
        super('', {className: 'inserter'});
    }
}