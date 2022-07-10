import AstNode from "../../AstNode.js";
import CallableCondition from "../../conditionAndBody/call/callable/CallableCondition.js";
import CallableBody from "../../conditionAndBody/call/callable/CallableBody.js";
import NewLine from "../../NewLine.js";
import Space from "../../Space.js";
import ConditionAndBodyNode from "../../conditionAndBody/ConditionAndBodyNode.js";

export default class CallableModule extends ConditionAndBodyNode {



    constructor() {
        super('', {className: ['callableModule']});
        let openBracket = new AstNode('['); super.insert(openBracket);
        this.condition = new CallableCondition(); super.insert(this.condition);
        let closeBracket = new AstNode(']');  super.insert(closeBracket);

        super.insert(new Space());

        // super.insert(new NewLine());
        // this.body = new CallableBody(); super.insert(this.body);
        // super.insert(new NewLine());
    }

    insert(chunk) {
        this.body.insert(chunk);
    }
}