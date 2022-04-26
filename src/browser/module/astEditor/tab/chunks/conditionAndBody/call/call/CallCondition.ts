import BaseChunk from "../../../BaseChunk";

export default class CallCondition extends BaseChunk {

    type: string;

    constructor() {
        super('', {className: 'callArgs'});
    }
}