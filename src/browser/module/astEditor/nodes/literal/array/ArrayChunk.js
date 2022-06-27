import AstNode from "../../AstNode";
import ArrayBody from "./ArrayBody";
import ArrayItem from "./ArrayItem";

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
            t: this.constructor.name,
            body: this.arrayBody.serializeSubChunks(),
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