import BaseNode from "../../BaseNode";
import ArrayBody from "./ArrayBody";
import ArrayItem from "./ArrayItem";

export default class ArrayChunk extends BaseNode {

    arrayBody: BaseNode;
    isVertical: boolean = false;

    constructor() {
        super('', {className: 'array'});

        let openBracket = new BaseNode('[', {className:'bracket'}); super.insert(openBracket);
        this.arrayBody = new ArrayBody; super.insert(this.arrayBody);
        let closeBracket = new BaseNode(']', {className:'bracket'});  super.insert(closeBracket);
    }

    getBody() {
        return this.arrayBody;
    }

    isEmpty(): boolean {
        return this.arrayBody.isEmpty();
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            body: this.arrayBody.serializeSubChunks(),
            isVertical: this.isVertical,
        }
    }

    switchViewMode() {
        this.isVertical = !this.isVertical;
    }

    insert(arrayItem: ArrayItem) {
        this.arrayBody.insert(arrayItem);
    }
}