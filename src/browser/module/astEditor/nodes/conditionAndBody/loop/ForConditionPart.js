import AstNode from "../../AstNode.js";
import ForConditionPartInternal from "./ForConditionPartInternal.js";

export default class ForConditionPart extends AstNode {

    constructor(txt = '', options = {}) {
        super('', {className: 'forConditionPart'});

        this.internal = new ForConditionPartInternal();
        super.insert(this.internal);
        let closePart = new AstNode('; ');
        super.insert(closePart);
    }

    getInternal() { return this.internal; }

    serialize() {
        return {
            ...super.serialize(),
            internal: this.internal.serializeSubNodes(),
        };
    }

    getLastChunk() { return this.internal.getLastChunk(); }
    insert(chunk) { this.internal.insert(chunk); }
}