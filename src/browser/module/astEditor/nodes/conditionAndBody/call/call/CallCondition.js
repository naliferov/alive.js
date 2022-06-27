import AstNode from "../../../AstNode";

export default class CallCondition extends AstNode {

    type;

    constructor() {
        super('', {className: 'callCondition'});
    }
}