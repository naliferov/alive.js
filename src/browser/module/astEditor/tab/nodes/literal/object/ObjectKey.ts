import AstNode from "../../AstNode";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectKey extends AstNode {

    itemParts: AstNode;

    constructor() {
        super('', {className: 'objectKey'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    getLastChunk(): AstNode {
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

    insert(chunk: AstNode) {
        this.itemParts.insert(chunk);
    }
}