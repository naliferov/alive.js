import AstNode from "../AstNode.js";
import Keyword from "../Keyword.js";

export default class Id extends AstNode {

    letChunk;
    newChunk;
    nameChunk;

    subId;

    constructor(name) {
        super('', {className: 'id'});
        this.letChunk = new Keyword('let');
        this.letChunk.hide()

        this.newChunk = new Keyword('new ');
        this.newChunk.hide();

        super.insert(this.letChunk);
        super.insert(this.newChunk);

        this.nameChunk = new AstNode(name, {className: 'namePart'});
        super.insert(this.nameChunk);
    }

    /*putSubId(node) {
        if (!this.subId) this.subId = node;
        super.insert(this.subId);
    }*/

    serialize() {
        const data = {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            mode: this.isLet() ? 'let' : this.isNew() ? 'new' : '',
        };
        if (this.subId) data.subId = this.subId.serialize();

        return data;
    }

    iEditTxt() {
        this.nameChunk.iEditTxt();
        this.nameChunk.focus();
    }

    oEditTxt() {
        this.nameChunk.oEditTxt();
    }

    getTxt() {
        return this.nameChunk.getTxt();
    }

    switchKeyword() {
        if (this.isLet()) {
            this.letChunk.hide();
            this.newChunk.show();
        } else if (this.isNew()) {
            this.letChunk.hide()
            this.newChunk.hide();
            this.space.hide();
        } else {
            this.letChunk.show();
        }
    }

    isLet() { return this.letChunk.isShowed() }
    isNew() { return this.newChunk.isShowed() }
    enableLet() { this.letChunk.show(); }
    enableNew() { this.newChunk.show(); }
}