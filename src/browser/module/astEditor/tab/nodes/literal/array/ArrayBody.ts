import BaseNode from "../../BaseNode";
import IfCondition from "../../conditionAndBody/if/IfCondition";
import ArrayItem from "./ArrayItem";

export default class ArrayBody extends BaseNode {

    constructor() { super('', {className: 'arrayBody'}); }

    insert(arrayItem: ArrayItem) {
        super.insert(arrayItem);
    }
}