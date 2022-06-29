import AstNode from "./AstNode.js";

export default class Main extends AstNode {
    constructor() {
        super('', {className: 'mainNode'});
    }
}