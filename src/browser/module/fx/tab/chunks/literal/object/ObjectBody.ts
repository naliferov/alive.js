import BaseChunk from "../../BaseChunk";
import ObjectItem from "./ObjectItem";

export default class ObjectBody extends BaseChunk {

    constructor() { super('', {className: 'arrayBody'}); }

    insert(arrayItem: ObjectItem) {
        super.insert(arrayItem);
    }
}