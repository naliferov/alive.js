import BaseNode from "../../BaseNode";
import ObjectBody from "./ObjectBody";
import ObjectItem from "./ObjectItem";

export default class ObjectChunk extends BaseNode {

    objectBody: ObjectBody;

    constructor() {
        super('', {className: 'object'});

        let openBracket = new BaseNode('{', {className:'bracket'}); super.insert(openBracket);
        this.objectBody = new ObjectBody; super.insert(this.objectBody);
        let closeBracket = new BaseNode('}', {className:'bracket'});  super.insert(closeBracket);
    }

    getBody() {
        return this.objectBody;
    }

    isEmpty(): boolean {
        return this.objectBody.isEmpty();
    }

    serialize(): object {
        return {
            t: this.constructor.name,
            body: this.objectBody.serializeSubChunks(),
        }
    }

    insert(chunk: ObjectItem) {
        this.objectBody.insert(chunk);
    }
}