import BaseChunk from "../BaseChunk";
import T from "../../../../../../T";
import {subst} from "urlcat";

export default class NameOfDynProp extends BaseChunk {

    constructor(name: string) {
        super();

        const openBracket = new BaseChunk('[');
        this.insert(openBracket);

        const nameChunk = new BaseChunk(`'${name}'`);
        this.insert(nameChunk);

        const closeBracket = new BaseChunk(']');
        this.insert(closeBracket);
    }
}