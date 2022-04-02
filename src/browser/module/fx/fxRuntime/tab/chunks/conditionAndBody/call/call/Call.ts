import BaseChunk from "../../../BaseChunk";

export default class Call extends BaseChunk {

    type: string;
    args: BaseChunk;

    constructor() {
        super();

        const openBracket = new BaseChunk('(');
        this.args = new BaseChunk('', {className: 'callArgs'});
        const closeBracket = new BaseChunk(')');

        super.insert(openBracket);
        super.insert(this.args);
        super.insert(closeBracket);
    }

    insert(chunk: BaseChunk) {
        this.args.insert(chunk);
    }
}