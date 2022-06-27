import AstNode from "../../AstNode";

export default class ArrayBody extends AstNode {

    constructor() { super('', {className: 'arrayBody'}); }

    insert(arrayItem) {
        super.insert(arrayItem);
    }
}