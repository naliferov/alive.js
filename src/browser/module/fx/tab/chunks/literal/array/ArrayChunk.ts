import BaseChunk from "../../BaseChunk";
import ArrayBody from "./ArrayBody";
import ArrayItem from "./ArrayItem";

export default class ArrayChunk extends BaseChunk {

    arrayBody: BaseChunk;

    constructor() {
        super('', {className: 'array'});

        let openBracket = new BaseChunk('[', {className:'bracket'}); super.insert(openBracket);
        this.arrayBody = new ArrayBody; super.insert(this.arrayBody);
        let closeBracket = new BaseChunk(']', {className:'bracket'});  super.insert(closeBracket);
    }

    getBody() {
        return this.arrayBody;
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

    insert(arrayItem: ArrayItem) {
        this.arrayBody.insert(arrayItem);
    }
}