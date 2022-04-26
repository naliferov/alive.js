import BaseChunk from "../../BaseChunk";
import IfCondition from "../../conditionAndBody/if/IfCondition";
import ArrayItem from "./ArrayItem";

export default class ArrayBody extends BaseChunk {

    constructor() { super('', {className: 'arrayBody'}); }

    insert(arrayItem: ArrayItem) {
        super.insert(arrayItem);
    }
}