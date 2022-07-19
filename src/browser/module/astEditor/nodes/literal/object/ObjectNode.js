import AstNode from "../../AstNode.js";
import ObjectBody from "./ObjectBody.js";

export default class ObjectNode extends AstNode {

    objectBody;

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'object'});

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
            ...super.serialize(),
            body: this.objectBody.serializeSubNodes(),
        }
    }

    insert(chunk) {
        this.objectBody.insert(chunk);
    }
}