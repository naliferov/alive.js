import AstNode from "../../AstNode.js";
import ArrayItemParts from "./ArrayItemParts.js";
import NewLine from "../../NewLine.js";

export default class ArrayItem extends AstNode {

    itemParts;
    newLineChunk;

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'arrayItem'});
        this.itemParts = new ArrayItemParts; super.insert(this.itemParts);
        super.insert(new AstNode(', ', {className: 'comma'}));
    }

    getItemParts() {
        return this.itemParts;
    }

    addNewLineChunk() {
        this.newLineChunk = new NewLine();
        this.insert(this.newLineChunk);
    }

    removeNewLineSymbol() {
        this.getChildren()
    }

    serialize() {
        return {
            ...super.serialize(),
            itemParts: this.itemParts.serializeSubNodes(),
        }
    }

    insert(chunk) {
        this.itemParts.insert(chunk);
    }
}