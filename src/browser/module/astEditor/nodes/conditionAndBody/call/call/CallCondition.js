import ConditionNode from "../../ConditionNode.js";

export default class CallCondition extends ConditionNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'callCondition'});
    }
}