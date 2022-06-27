import AstNode from "../AstNode";

export default class SurroundInternal extends AstNode {
    constructor() {
        super('', {className: 'surroundInternal'});
    }
}