import AstNode from "../../AstNode.js";
import CallableCondition from "../../conditionAndBody/call/callable/CallableCondition.js";
import CallCondition from "../../conditionAndBody/call/call/CallCondition.js";

export default class CallModule extends CallCondition {

    constructor() {
        super('', {className: ['callModule']});
        let openBracket = new AstNode('('); super.insert(openBracket);
        this.condition = new CallableCondition(); super.insert(this.condition);
        let closeBracket = new AstNode(')');  super.insert(closeBracket);
    }

    insert(chunk) {
        this.body.insert(chunk);
    }
}