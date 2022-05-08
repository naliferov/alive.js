import AstNode from "../../AstNode";
import ObjectItem from "./ObjectItem";

export default class ObjectBody extends AstNode {

    constructor() { super('', {className: 'objectBody'}); }

    insert(objectItem: ObjectItem) {
        super.insert(objectItem);
    }
}