import BaseNode from "../../BaseNode";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectKey extends BaseNode {

    itemParts: BaseNode;

    constructor() {
        super('', {className: 'objectKey'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    getLastChunk(): BaseNode {
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

    insert(chunk: BaseNode) {
        this.itemParts.insert(chunk);
    }
}