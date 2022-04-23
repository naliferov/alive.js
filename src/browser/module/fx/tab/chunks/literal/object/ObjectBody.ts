import BaseChunk from "../../BaseChunk";
import ObjectItem from "./ObjectItem";

export default class ObjectBody extends BaseChunk {

    constructor() { super('', {className: 'objectBody'}); }

    insert(objectItem: ObjectItem) {
        super.insert(objectItem);
    }
}