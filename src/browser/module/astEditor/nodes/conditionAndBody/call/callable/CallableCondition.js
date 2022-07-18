import ConditionNode from "../../ConditionNode.js";

export default class CallableCondition extends ConditionNode {
    constructor(txt = '', options = {}) {
        super('', { ...options, className: ['callableCondition']});
    }
}