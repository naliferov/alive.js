import AstNode from "../../AstNode.js";

export default class ObjectBody extends AstNode {

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'objectBody'});
    }
}