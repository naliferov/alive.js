import BaseNode from "./BaseNode";

export default class Op extends BaseNode {

    opType: BaseNode;

    constructor(op: string) {
        super('', {className: 'op'});

        const openSpace = new BaseNode('.').visibilityHide();
        this.opType = new BaseNode(op, {className: 'opType'});
        const closeSpace = new BaseNode('.').visibilityHide();

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