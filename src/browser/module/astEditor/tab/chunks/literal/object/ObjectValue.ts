import BaseChunk from "../../BaseChunk";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectValue extends BaseChunk {

    itemParts: BaseChunk;

    constructor() {
        super('', {className: 'objectValue'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    isEmpty(): boolean {
        return this.itemParts.isEmpty();
    }

    getFirstChunk(): BaseChunk {
        return this.itemParts.getFirstChunk();
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