import AstNode from "../../../AstNode";
import CallCondition from "./CallCondition";

export default class Call extends AstNode {

    type: string;
    args: CallCondition;

    constructor() {
        super('', {className: 'call'});

        const openBracket = new AstNode('(');
        this.args = new CallCondition;
        const closeBracket = new AstNode(')');

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

    insert(chunk: AstNode) {
        this.args.insert(chunk);
    }
}