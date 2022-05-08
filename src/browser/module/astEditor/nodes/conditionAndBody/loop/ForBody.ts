import AstNode from "../../AstNode";

export default class ForBody extends AstNode {
    constructor() {
        super('', {className: ['forBody', 'shift']});
    }
}