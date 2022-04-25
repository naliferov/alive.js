import Main from "./tab/chunks/Main";
import Name from "./tab/chunks/literal/Name";
import Op from "./tab/chunks/Op";
import Literal from "./tab/chunks/literal/Literal";
import NewLine from "./tab/chunks/NewLine";
import For from "./tab/chunks/conditionAndBody/loop/For";
import If from "./tab/chunks/conditionAndBody/if/If";
import ForConditionPart from "./tab/chunks/conditionAndBody/loop/ForConditionPart";
import Callable from "./tab/chunks/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "./tab/chunks/conditionAndBody/call/callable/ConditionPart";
import ArrayChunk from "./tab/chunks/literal/array/ArrayChunk";
import ArrayItem from "./tab/chunks/literal/array/ArrayItem";
import ObjectChunk from "./tab/chunks/literal/object/ObjectChunk";

export default class JsExporter {

    buildJsModule(mainChunk: Main) {
        return mainChunk.serializeSubChunks();
    }
}