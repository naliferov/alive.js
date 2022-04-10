import BaseChunk from "../../BaseChunk";
import NewLine from "../../NewLine";
import Space from "../../Space";
import BodyChunk from "../BodyChunk";

export default class IfBody extends BodyChunk {

    constructor() {
        super('', {className: ['ifBody', 'shift']});
    }
}