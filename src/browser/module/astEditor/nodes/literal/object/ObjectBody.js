import AstNode from "../../AstNode.js";

export default class ObjectBody extends AstNode {

    constructor() { super('', {className: 'objectBody'}); }

    insert(objectItem) {
        super.insert(objectItem);
    }
}