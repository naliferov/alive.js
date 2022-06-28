import AstNode from "../../AstNode.js";
import ObjectBody from "./ObjectBody.js";

export default class ObjectChunk extends AstNode {

    objectBody;

    constructor() {
        super('', {className: 'object'});

        let openBracket = new AstNode('{', {className:'bracket'}); super.insert(openBracket);
        this.objectBody = new ObjectBody; super.insert(this.objectBody);
        let closeBracket = new AstNode('}', {className:'bracket'});  super.insert(closeBracket);
    }

    getBody() {
        return this.objectBody;
    }

    isEmpty() {
        return this.objectBody.isEmpty();
    }

    serialize() {
        return {
            t: this.constructor.name,
            body: this.objectBody.serializeSubChunks(),
        }
    }

    insert(chunk) {
        this.objectBody.insert(chunk);
    }
}