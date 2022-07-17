import AstNode from "../AstNode.js";
import SurroundInternal from "./SurroundInternal.js";

export default class Surround extends AstNode {

    constructor() {
        super('', {className: 'surround'});
        super.insert(new AstNode('('));
        this.internal = new SurroundInternal; super.insert(this.internal);
        super.insert(new AstNode(')'));
    }

    insert(chunk) { this.internal.insert(chunk); }
    getFirstChunk() { return this.internal.getFirstChunk(); }
    serialize() {
        return {
            ...super.serialize(),
            internal: this.internal.serializeSubNodes(),
        };
    }
}