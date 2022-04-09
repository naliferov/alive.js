import BaseChunk from "../../../BaseChunk";
import NewLine from "../../../NewLine";
import Space from "../../../Space";
import CallableCondition from "./CallableCondition";
import CallableBody from "./CallableBody";
import ConditionAndBodyChunk from "../../ConditionAndBodyChunk";

export default class Callable extends ConditionAndBodyChunk {

    condition: CallableCondition;
    body: CallableBody;

    constructor() {
        super('', {className: 'callable'});

        let openBracket = new BaseChunk('('); super.insert(openBracket);
        this.condition = new CallableCondition(); super.insert(this.condition);
        let closeBracket = new BaseChunk(')');  super.insert(closeBracket);

        super.insert(new Space());
        let arrow = new BaseChunk('=>');  super.insert(arrow);
        super.insert(new Space());

        openBracket = new BaseChunk('{'); super.insert(openBracket);
        super.insert(new NewLine());
        this.body = new CallableBody(); super.insert(this.body);
        super.insert(new NewLine());
        openBracket = new BaseChunk('}'); super.insert(openBracket);
    }
}