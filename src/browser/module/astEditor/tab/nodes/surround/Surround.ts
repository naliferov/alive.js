import BaseNode from "../BaseNode";
import SurroundInternal from "./SurroundInternal";

export default class Surround extends BaseNode {

    internal: SurroundInternal;

    constructor() {
        super('', {className: 'surround'});
        let openBracket = new BaseNode('('); super.insert(openBracket);
        this.internal = new SurroundInternal; super.insert(this.internal);
        let closeBracket = new BaseNode(')');  super.insert(closeBracket);
    }

    insert(chunk: BaseNode) {
        this.internal.insert(chunk);
    }

    getFirstChunk() {
        return this.internal.getFirstChunk();
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }
}