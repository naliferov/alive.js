import BaseChunk from "../BaseChunk";
import SurroundInternal from "./SurroundInternal";

export default class Surround extends BaseChunk {

    internal: SurroundInternal;

    constructor() {
        super('', {className: 'surround'});
        let openBracket = new BaseChunk('('); super.insert(openBracket);
        this.internal = new SurroundInternal; super.insert(this.internal);
        let closeBracket = new BaseChunk(')');  super.insert(closeBracket);
    }

    insert(chunk: BaseChunk) {
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