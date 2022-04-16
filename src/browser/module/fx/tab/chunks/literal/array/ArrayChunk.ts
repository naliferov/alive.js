import BaseChunk from "../../BaseChunk";
import ArrayBody from "./ArrayBody";

export default class ArrayChunk extends BaseChunk {

    arrayBody: BaseChunk;

    constructor() {
        super('', {className: 'array'});

        let openBracket = new BaseChunk('[', {className:'bracket'}); super.insert(openBracket);
        this.arrayBody = new ArrayBody; super.insert(this.arrayBody);
        let closeBracket = new BaseChunk(']', {className:'bracket'});  super.insert(closeBracket);
    }

    isEmpty(): boolean {
        return this.arrayBody.isEmpty();
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            body: this.arrayBody.serializeSubChunks(),
        }
    }

    insert(chunk: BaseChunk) {
        this.arrayBody.insert(chunk);
    }
}