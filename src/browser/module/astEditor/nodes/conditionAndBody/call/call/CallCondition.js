import AstNode from "../../../AstNode.js";

export default class CallCondition extends AstNode {

    type;

    constructor() {
        super('', {className: 'callCondition'});
    }
}