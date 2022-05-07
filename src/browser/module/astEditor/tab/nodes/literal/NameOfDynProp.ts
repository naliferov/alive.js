import AstNode from "../AstNode";
import T from "../../../../../../T";
import {subst} from "urlcat";

export default class NameOfDynProp extends AstNode {

    constructor(name: string) {
        super();

        const openBracket = new AstNode('[');
        this.insert(openBracket);

        const nameChunk = new AstNode(`'${name}'`);
        this.insert(nameChunk);

        const closeBracket = new AstNode(']');
        this.insert(closeBracket);
    }
}