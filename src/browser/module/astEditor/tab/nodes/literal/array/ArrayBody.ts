import AstNode from "../../AstNode";
import IfCondition from "../../conditionAndBody/if/IfCondition";
import ArrayItem from "./ArrayItem";

export default class ArrayBody extends AstNode {

    constructor() { super('', {className: 'arrayBody'}); }

    insert(arrayItem: ArrayItem) {
        super.insert(arrayItem);
    }
}