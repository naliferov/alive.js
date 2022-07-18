import ConditionNode from "../ConditionNode.js";

export default class IfCondition extends ConditionNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'ifCondition'});
    }
}