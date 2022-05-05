import BaseNode from "../../../BaseNode";

export default class CallCondition extends BaseNode {

    type: string;

    constructor() {
        super('', {className: 'callArgs'});
    }
}