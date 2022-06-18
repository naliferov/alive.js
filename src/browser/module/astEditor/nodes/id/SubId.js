import AstNode from "../AstNode";
import SubIdContainer from "./SubIdContainer";

export default class SubId extends AstNode {

    container;
    subId;

    constructor() {
        super('', {className: 'subId'});
        const bracket = new AstNode('[', {className: 'bracket'});
        super.insert(bracket);
        this.container = new SubIdContainer;
        super.insert(this.container);

        const bracket2 = new AstNode(']', {className: 'bracket'});
        super.insert(bracket2);
    }

    putSubId(node) {
        if (!this.subId) this.subId = node;
        super.insert(this.subId);
    }

    serialize() {
        const data = {
            t: this.constructor.name,
            container: this.container.serializeSubChunks(),
        }
        if (this.subId) data.subId = this.subId.serialize();
        return data;
    }

    insert(chunk) { this.container.insert(chunk); }

    /*iEditTxt() {
        this.nameChunk.iEditTxt();
        this.nameChunk.focus();
    }

    oEditTxt() {
        this.nameChunk.oEditTxt();
    }*/
}