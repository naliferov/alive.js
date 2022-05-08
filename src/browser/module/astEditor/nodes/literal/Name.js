import AstNode from "../AstNode";

export default class Name extends AstNode {

    letChunk;
    newChunk;
    nameChunk;

    constructor(name) {
        super('', {className: 'name'});
        this.letChunk = new AstNode('let ', {className: 'keyword', hidden: true});
        this.newChunk = new AstNode('new ', {className: 'keyword', hidden: true});
        super.insert(this.letChunk);
        super.insert(this.newChunk);

        this.nameChunk = new AstNode(name, {className: 'namePart'});
        super.insert(this.nameChunk);
    }

    serialize() {
        return {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            mode: this.isLet() ? 'let' : this.isNew() ? 'new' : '',
        }
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
        } else {
            this.letChunk.show();
        }
    }

    isLet() {
        return this.letChunk.isShowed()
    }

    isNew() {
        return this.newChunk.isShowed()
    }

    enableLet() {
        this.letChunk.show();
    }

    enableNew() {
        this.newChunk.show();
    }

    toggleLetDisplay() {
        this.letChunk.toggleDisplay()
    }
}