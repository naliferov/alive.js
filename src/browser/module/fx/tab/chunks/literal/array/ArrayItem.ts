import BaseChunk from "../../BaseChunk";
import ArrayItemParts from "./ArrayItemParts";
import NewLine from "../../NewLine";

export default class ArrayItem extends BaseChunk {

    itemParts: BaseChunk;
    newLineChunk: BaseChunk|null

    constructor() {
        super('', {className: 'arrayItem'});
        this.itemParts = new ArrayItemParts; super.insert(this.itemParts);
        super.insert(new BaseChunk(', ', {className: 'comma'}));
    }

    getItemParts(): BaseChunk {
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

    insert(chunk: BaseChunk) {
        this.itemParts.insert(chunk);
    }
}