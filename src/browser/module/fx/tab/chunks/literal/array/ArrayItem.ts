import BaseChunk from "../../BaseChunk";
import ArrayItemParts from "./ArrayItemParts";

export default class ArrayItem extends BaseChunk {

    itemParts: BaseChunk;

    constructor() {
        super('', {className: 'arrayItem'});
        this.itemParts = new ArrayItemParts; super.insert(this.itemParts);
        super.insert(new BaseChunk(', ', {className: 'comma'}));
    }

    getItemParts(): BaseChunk {
        return this.itemParts;
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            itemParts: this.itemParts.serializeSubChunks(),
        }
    }

    insert(chunk: BaseChunk) {
        this.itemParts.insert(chunk);
    }
}