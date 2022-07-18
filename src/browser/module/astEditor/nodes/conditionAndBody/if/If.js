import AstNode from "../../AstNode.js";
import NewLine from "../../NewLine.js";
import Space from "../../Space.js";
import IfCondition from "./IfCondition.js";
import IfBody from "./IfBody.js";
import ConditionAndBodyNode from "../ConditionAndBodyNode.js";

export default class If extends ConditionAndBodyNode {

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'if'});

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