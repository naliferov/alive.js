import AstNode from "./AstNode.js";

export default class Op extends AstNode {

    opType;

    constructor(op, options = {}) {
        super('', {...options, className: 'op'});

        const openSpace = new AstNode('.');
        openSpace.visibilityHide();

        this.opType = new AstNode(op, {className: 'opType'});
        const closeSpace = new AstNode('.');
        closeSpace.visibilityHide();

        super.insert(openSpace);
        super.insert(this.opType);
        super.insert(closeSpace);
    }

    iEditTxt() {
        this.opType.iEditTxt();
        this.opType.focus();
    }

    oEditTxt() {
        this.opType.oEditTxt();
    }

    serialize() {
        return {
            ...super.serialize(),
            op: this.opType.getTxt(),
        }
    }

    getTxt() {
        return this.opType.getTxt();
    }

    mark() { this.opType.mark() }
    unmark() { this.opType.unmark() }
}