import AstNode from "../AstNode.js";
import SurroundInternal from "./SurroundInternal.js";

export default class Surround extends AstNode {

    internal;

    constructor() {
        super('', {className: 'surround'});
        let openBracket = new AstNode('('); super.insert(openBracket);
        this.internal = new SurroundInternal; super.insert(this.internal);
        let closeBracket = new AstNode(')');  super.insert(closeBracket);
    }

    insert(chunk) {
        this.internal.insert(chunk);
    }

    getFirstChunk() {
        return this.internal.getFirstChunk();
    }

    serialize() {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubNodes(),
        };
    }
}