import AstNode from "../../AstNode";
import NewLine from "../../NewLine";
import Space from "../../Space";
import IfCondition from "./IfCondition";
import IfBody from "./IfBody";
import ConditionAndBodyNode from "../ConditionAndBodyNode";

export default class If extends ConditionAndBodyNode {

    constructor() {
        super('', {className: 'if'});

        const ifChunk = new AstNode('if', {className: ['ifKeyword', 'keyword']});

        super.insert(ifChunk);
        super.insert(new Space);

        let openBracket = new AstNode('('); super.insert(openBracket);
        this.condition = new IfCondition; super.insert(this.condition);
        let closeBracket = new AstNode(')');  super.insert(closeBracket);

        super.insert(new Space);
        openBracket = new AstNode('{'); super.insert(openBracket);
        super.insert(new NewLine);
        this.body = new IfBody; super.insert(this.body);
        super.insert(new NewLine);
        openBracket = new AstNode('}'); super.insert(openBracket);
    }
}