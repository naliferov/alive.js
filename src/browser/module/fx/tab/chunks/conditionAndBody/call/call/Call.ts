import BaseChunk from "../../../BaseChunk";
import CallCondition from "./CallCondition";

export default class Call extends BaseChunk {

    type: string;
    args: CallCondition;

    constructor() {
        super('', {className: 'call'});

        const openBracket = new BaseChunk('(');
        this.args = new CallCondition;
        const closeBracket = new BaseChunk(')');

        super.insert(openBracket);
        super.insert(this.args);
        super.insert(closeBracket);
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            condition: this.args.serializeSubChunks(),
        };
    }

    insert(chunk: BaseChunk) {
        this.args.insert(chunk);
    }
}