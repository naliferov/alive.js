import BaseChunk from "../../BaseChunk";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectKey extends BaseChunk {

    itemParts: BaseChunk;

    constructor() {
        super('', {className: 'objectKey'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    getLastChunk(): BaseChunk {
        return this.itemParts.getLastChunk();
    }

    isEmpty(): boolean {
        return this.itemParts.isEmpty();
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