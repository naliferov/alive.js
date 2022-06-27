import AstNode from "../../AstNode";

export default class ObjectBody extends AstNode {

    constructor() { super('', {className: 'objectBody'}); }

    insert(objectItem) {
        super.insert(objectItem);
    }
}