import AstNode from "../../AstNode.js";
import ObjectItemParts from "./ObjectItemParts.js";

export default class ObjectValue extends AstNode {

    itemParts;

    constructor() {
        super('', {className: 'objectValue'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    isEmpty() {
        return this.itemParts.isEmpty();
    }

    getFirstChunk() {
        return this.itemParts.getFirstChunk();
    }

    serialize() {
        return {
            t: this.constructor.name,
            itemParts: this.itemParts.serializeSubChunks(),
        }
    }

    insert(chunk) {
        this.itemParts.insert(chunk);
    }
}