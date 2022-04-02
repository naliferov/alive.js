import BaseChunk from "./BaseChunk";

export default class Surround extends BaseChunk {

    internal: BaseChunk;

    constructor() {
        super('', {className: 'surround'});
        let openBracket = new BaseChunk('('); super.insert(openBracket);
        this.internal = new BaseChunk('', {className: 'internal'}); super.insert(this.internal);
        let closeBracket = new BaseChunk(')');  super.insert(closeBracket);
    }

    insert(chunk: BaseChunk) {
        this.internal.insert(chunk);
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            internal: this.internal.serializeSubChunks(),
        };
    }
}