import BaseChunk from "./BaseChunk";

export default class Op extends BaseChunk {

    opType: BaseChunk;

    constructor(op: string) {
        super('', {className: 'op'});

        const openSpace = new BaseChunk(' ');
        this.opType = new BaseChunk(op, {className: 'opType'});
        const closeSpace = new BaseChunk(' ');

        super.insert(openSpace);
        super.insert(this.opType);
        super.insert(closeSpace);
    }

    serialize() {
        return {
            t: this.constructor.name,
            op: this.opType.getTxt(),
        }
    }

    mark() { this.opType.mark() }
    unmark() { this.opType.unmark() }
}