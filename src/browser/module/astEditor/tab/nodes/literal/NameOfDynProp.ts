import BaseNode from "../BaseNode";
import T from "../../../../../../T";
import {subst} from "urlcat";

export default class NameOfDynProp extends BaseNode {

    constructor(name: string) {
        super();

        const openBracket = new BaseNode('[');
        this.insert(openBracket);

        const nameChunk = new BaseNode(`'${name}'`);
        this.insert(nameChunk);

        const closeBracket = new BaseNode(']');
        this.insert(closeBracket);
    }
}