import BaseChunk from "../../BaseChunk";

export default class ObjectChunk extends BaseChunk {

    objectBody: BaseChunk;

    constructor() {
        super('', {className: 'object'});

        let openBracket = new BaseChunk('[', {className:'bracket'}); super.insert(openBracket);
        this.objectBody = new BaseChunk(''); super.insert(this.objectBody);
        let closeBracket = new BaseChunk(']', {className:'bracket'});  super.insert(closeBracket);
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            body: this.objectBody.serializeSubChunks(),
        }
    }

    insert(chunk: BaseChunk) {
        this.objectBody.insert(chunk);
    }
}