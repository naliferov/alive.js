import AstNode from "../../../AstNode";
import NewLine from "../../../NewLine";
import Space from "../../../Space";
import CallableCondition from "./CallableCondition";
import CallableBody from "./CallableBody";
import ConditionAndBodyNode from "../../ConditionAndBodyNode";

export default class Callable extends ConditionAndBodyNode {

    condition: CallableCondition;
    body: CallableBody;

    constructor() {
        super('', {className: 'callable'});

        let openBracket = new AstNode('('); super.insert(openBracket);
        this.condition = new CallableCondition(); super.insert(this.condition);
        let closeBracket = new AstNode(')');  super.insert(closeBracket);

        super.insert(new Space());
        let arrow = new AstNode('=>');  super.insert(arrow);
        super.insert(new Space());

        openBracket = new AstNode('{'); super.insert(openBracket);
        super.insert(new NewLine());
        this.body = new CallableBody(); super.insert(this.body);
        super.insert(new NewLine());
        openBracket = new AstNode('}'); super.insert(openBracket);
    }
}