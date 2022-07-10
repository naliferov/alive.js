import AstNode from "../../AstNode.js";
import CallableCondition from "../../conditionAndBody/call/callable/CallableCondition.js";
import CallCondition from "../../conditionAndBody/call/call/CallCondition.js";

export default class CallModule extends CallCondition {

    constructor() {
        super('', {className: ['simpleModule']});
    }
}