import BaseChunk from "../../BaseChunk";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectValue extends BaseChunk {

    itemParts: BaseChunk;

    constructor() {
        super('', {className: 'objectValue'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
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