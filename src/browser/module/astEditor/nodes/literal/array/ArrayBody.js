import AstNode from "../../AstNode.js";

export default class ArrayBody extends AstNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'arrayBody'});
    }
}