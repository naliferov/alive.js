import BaseChunk from "../../BaseChunk";

export default class ObjectItem extends BaseChunk {

    itemParts: BaseChunk;

    constructor() {
        super('', {className: 'arrayItem'});
        this.itemParts = new BaseChunk(''); super.insert(this.itemParts);
        let coma = new BaseChunk(',');  super.insert(coma);
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            body: this.itemParts.serializeSubChunks(),
        }
    }

    insert(chunk: BaseChunk) {
        this.itemParts.insert(chunk);
    }
}