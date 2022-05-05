import BaseNode from "../../BaseNode";
import NewLine from "../../NewLine";
import Space from "../../Space";
import IfCondition from "./IfCondition";
import IfBody from "./IfBody";
import ConditionAndBodyNode from "../ConditionAndBodyNode";

export default class If extends ConditionAndBodyNode {

    condition: IfCondition;
    body: IfBody;

    constructor() {
        super('', {className: 'if'});

        const ifChunk = new BaseNode('if', {className: ['ifKeyword', 'keyword']});

        super.insert(ifChunk);
        super.insert(new Space);

        let openBracket = new BaseNode('('); super.insert(openBracket);
        this.condition = new IfCondition; super.insert(this.condition);
        let closeBracket = new BaseNode(')');  super.insert(closeBracket);

        super.insert(new Space);
        openBracket = new BaseNode('{'); super.insert(openBracket);
        super.insert(new NewLine);
        this.body = new IfBody; super.insert(this.body);
        super.insert(new NewLine);
        openBracket = new BaseNode('}'); super.insert(openBracket);
    }
}