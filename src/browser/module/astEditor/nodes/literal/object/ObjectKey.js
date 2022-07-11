import AstNode from "../../AstNode.js";
import ObjectItemParts from "./ObjectItemParts.js";

export default class ObjectKey extends AstNode {

    itemParts;

    constructor() {
        super('', {className: 'objectKey'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    getLastChunk() {
        return this.itemParts.getLastChunk();
    }

    isEmpty() {
        return this.itemParts.isEmpty();
    }

    serialize() {
        return {
            t: this.constructor.name,
            itemParts: this.itemParts.serializeSubNodes(),
        }
    }

    insert(chunk) {
        this.itemParts.insert(chunk);
    }
}