import BaseNode from "../../../BaseNode";
import CallCondition from "./CallCondition";

export default class Call extends BaseNode {

    type: string;
    args: CallCondition;

    constructor() {
        super('', {className: 'call'});

        const openBracket = new BaseNode('(');
        this.args = new CallCondition;
        const closeBracket = new BaseNode(')');

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

    insert(chunk: BaseNode) {
        this.args.insert(chunk);
    }
}