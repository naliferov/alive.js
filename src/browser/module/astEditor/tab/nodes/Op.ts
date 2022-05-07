import AstNode from "./AstNode";

export default class Op extends AstNode {

    opType: AstNode;

    constructor(op: string) {
        super('', {className: 'op'});

        const openSpace = new AstNode('.').visibilityHide();
        this.opType = new AstNode(op, {className: 'opType'});
        const closeSpace = new AstNode('.').visibilityHide();

        super.insert(openSpace);
        super.insert(this.opType);
        super.insert(closeSpace);
    }

    iEditTxt() {
        this.opType.iEditTxt();
    }

    serialize() {
        return {
            t: this.constructor.name,
            op: this.opType.getTxt(),
        }
    }

    getTxt(): string {
        return this.opType.getTxt();
    }

    mark() { this.opType.mark() }
    unmark() { this.opType.unmark() }
}