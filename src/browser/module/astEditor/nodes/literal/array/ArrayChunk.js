import AstNode from "../../AstNode.js";
import ArrayBody from "./ArrayBody.js";

export default class ArrayChunk extends AstNode {

    arrayBody;
    isVertical = false;

    constructor() {
        super('', {className: 'array'});

        let openBracket = new AstNode('[', {className:'bracket'}); super.insert(openBracket);
        this.arrayBody = new ArrayBody; super.insert(this.arrayBody);
        let closeBracket = new AstNode(']', {className:'bracket'});  super.insert(closeBracket);
    }

    getBody() {
        return this.arrayBody;
    }

    isEmpty() {
        return this.arrayBody.isEmpty();
    }

    serialize() {
        return {
            ...super.serialize(),
            body: this.arrayBody.serializeSubNodes(),
            isVertical: this.isVertical,
        }
    }

    switchViewMode() {
        this.isVertical = !this.isVertical;
    }

    insert(arrayItem) {
        this.arrayBody.insert(arrayItem);
    }
}