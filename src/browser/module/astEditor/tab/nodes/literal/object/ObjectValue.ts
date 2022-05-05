import BaseNode from "../../BaseNode";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectValue extends BaseNode {

    itemParts: BaseNode;

    constructor() {
        super('', {className: 'objectValue'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    isEmpty(): boolean {
        return this.itemParts.isEmpty();
    }

    getFirstChunk(): BaseNode {
        return this.itemParts.getFirstChunk();
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