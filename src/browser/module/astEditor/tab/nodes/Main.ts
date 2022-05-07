import AstNode from "./AstNode";

export default class Main extends AstNode {
    constructor() {
        super('', {className: 'mainChunk'});
    }
}