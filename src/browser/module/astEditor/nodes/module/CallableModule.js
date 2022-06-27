import AstNode from "../AstNode";
import CallableCondition from "../conditionAndBody/call/callable/CallableCondition";
import CallableBody from "../conditionAndBody/call/callable/CallableBody";
import NewLine from "../NewLine";
import Space from "../Space";
import ConditionAndBodyNode from "../conditionAndBody/ConditionAndBodyNode";

export default class CallableModule extends ConditionAndBodyNode {

    condition;
    body;

    constructor() {
        super('', {className: ['callableModule']});
        let openBracket = new AstNode('['); super.insert(openBracket);
        this.condition = new CallableCondition(); super.insert(this.condition);
        let closeBracket = new AstNode(']');  super.insert(closeBracket);

        super.insert(new Space());

        super.insert(new NewLine());
        this.body = new CallableBody(); super.insert(this.body);
        super.insert(new NewLine());
    }

    insert(chunk) {
        this.body.insert(chunk);
    }
}