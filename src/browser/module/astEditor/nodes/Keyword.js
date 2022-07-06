import AstNode from "./AstNode.js";

export default class Keyword extends AstNode {

    kType;

    constructor(type) {
        super('', {className: ['keyword']});

        this.kType = new AstNode(type, {className: 'keyword'});
        const closeSpace = new AstNode('.');
        closeSpace.visibilityHide();

        super.insert(this.kType);
        super.insert(closeSpace);
    }

    iEditTxt() {
        this.kType.iEditTxt();
        this.kType.focus();
    }

    oEditTxt() {
        this.kType.oEditTxt();
    }

    serialize() {
        return {
            t: this.constructor.name,
            keyword: this.kType.getTxt(),
        }
    }

    getTxt() {
        return this.kType.getTxt();
    }

    mark() { this.kType.mark() }
    unmark() { this.kType.unmark() }
}