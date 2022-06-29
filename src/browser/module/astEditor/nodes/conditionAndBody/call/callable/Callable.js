import AstNode from "../../../AstNode.js";
import NewLine from "../../../NewLine.js";
import Space from "../../../Space.js";
import CallableCondition from "./CallableCondition.js";
import CallableBody from "./CallableBody.js";
import ConditionAndBodyNode from "../../ConditionAndBodyNode.js";

export default class Callable extends ConditionAndBodyNode {

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