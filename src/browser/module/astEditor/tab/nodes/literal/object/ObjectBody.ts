import BaseNode from "../../BaseNode";
import ObjectItem from "./ObjectItem";

export default class ObjectBody extends BaseNode {

    constructor() { super('', {className: 'objectBody'}); }

    insert(objectItem: ObjectItem) {
        super.insert(objectItem);
    }
}