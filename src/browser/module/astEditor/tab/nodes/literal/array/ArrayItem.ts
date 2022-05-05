import BaseNode from "../../BaseNode";
import ArrayItemParts from "./ArrayItemParts";
import NewLine from "../../NewLine";

export default class ArrayItem extends BaseNode {

    itemParts: BaseNode;
    newLineChunk: BaseNode|null

    constructor() {
        super('', {className: 'arrayItem'});
        this.itemParts = new ArrayItemParts; super.insert(this.itemParts);
        super.insert(new BaseNode(', ', {className: 'comma'}));
    }

    getItemParts(): BaseNode {
        return this.itemParts;
    }

    addNewLineChunk() {
        this.newLineChunk = new NewLine();
        this.insert(this.newLineChunk);
    }

    removeNewLineSymbol() {
        this.getChildren()
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