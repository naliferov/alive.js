import BaseNode from "./BaseNode";
import Op from "./Op";
import Literal from "./literal/Literal";
import Name from "./literal/Name";
import If from "./conditionAndBody/if/If";
import For from "./conditionAndBody/loop/For";
import Call from "./conditionAndBody/call/call/Call";
import Callable from "./conditionAndBody/call/callable/Callable";
import ArrayChunk from "./literal/array/ArrayChunk";
import ObjectChunk from "./literal/object/ObjectChunk";

export default class Inserter extends BaseNode {

    insertHandler;
    exitHandler;
    newChunkHandler;

    constructor() {
        super('', {className: 'inserter'});
    }

    setInsertHandler(handler) { this.insertHandler = handler; }
    setExitHandler(handler) { this.exitHandler = handler; }
    setNewChunkHandler(handler) { this.newChunkHandler = handler; }


}