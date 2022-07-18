import ConditionNode from "../ConditionNode.js";

export default class ForCondition extends ConditionNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: 'forCondition'});
    }
}