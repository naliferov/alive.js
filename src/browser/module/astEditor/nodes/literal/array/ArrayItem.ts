import AstNode from "../../AstNode";
import ArrayItemParts from "./ArrayItemParts";
import NewLine from "../../NewLine";

export default class ArrayItem extends AstNode {

    itemParts: AstNode;
    newLineChunk: AstNode|null

    constructor() {
        super('', {className: 'arrayItem'});
        this.itemParts = new ArrayItemParts; super.insert(this.itemParts);
        super.insert(new AstNode(', ', {className: 'comma'}));
    }

    getItemParts(): AstNode {
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

    insert(chunk: AstNode) {
        this.itemParts.insert(chunk);
    }
}