import BaseChunk from "../../BaseChunk";
import NewLine from "../../NewLine";
import Space from "../../Space";
import IfCondition from "./IfCondition";
import IfBody from "./IfBody";
import ConditionAndBodyChunk from "../ConditionAndBodyChunk";

export default class If extends ConditionAndBodyChunk {

    condition: IfCondition;
    body: IfCondition;

    constructor() {
        super('', {className: 'if'});

        const ifChunk = new BaseChunk('if', {className: ['ifKeyword', 'keyword']});

        super.insert(ifChunk);
        super.insert(new Space());

        let openBracket = new BaseChunk('('); super.insert(openBracket);
        this.condition = new IfCondition(); super.insert(this.condition);
        let closeBracket = new BaseChunk(')');  super.insert(closeBracket);

        super.insert(new Space());
        openBracket = new BaseChunk('{'); super.insert(openBracket);
        super.insert(new NewLine());

        this.body = new IfBody(); super.insert(this.body);
        super.insert(new NewLine());
        openBracket = new BaseChunk('}'); super.insert(openBracket);
    }
}