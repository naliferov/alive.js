import AstNode from "../../../AstNode";

export default class CallCondition extends AstNode {

    type: string;

    constructor() {
        super('', {className: 'callArgs'});
    }
}