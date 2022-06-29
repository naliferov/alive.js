import AstNode from "../AstNode.js";

export default class SurroundInternal extends AstNode {
    constructor() {
        super('', {className: 'surroundInternal'});
    }
}