import AstNode from "../../AstNode";
import ForConditionPartInternal from "./ForConditionPartInternal";

export default class ForConditionPart extends AstNode {

    internal: ForConditionPartInternal;

    constructor() {
        super('', {className: 'forConditionPart'});

        this.internal = new ForConditionPartInternal();
        super.insert(this.internal);
        let closePart = new AstNode('; ');
        super.insert(closePart);
    }

    getInternal() {
        return this.internal;
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }

    getLastChunk() {
        return this.internal.getLastChunk();
    }

    insert(chunk: AstNode) {
        this.internal.insert(chunk);
    }
}