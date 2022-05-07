import AstNode from "../../AstNode";
import ObjectItemParts from "./ObjectItemParts";

export default class ObjectValue extends AstNode {

    itemParts: AstNode;

    constructor() {
        super('', {className: 'objectValue'});
        this.itemParts = new ObjectItemParts; super.insert(this.itemParts);
    }

    isEmpty(): boolean {
        return this.itemParts.isEmpty();
    }

    getFirstChunk(): AstNode {
        return this.itemParts.getFirstChunk();
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