import Main from "./nodes/Main";
import Id from "./nodes/id/Id";
import Op from "./nodes/Op";
import Literal from "./nodes/literal/Literal";
import NewLine from "./nodes/NewLine";
import For from "./nodes/conditionAndBody/loop/For";
import If from "./nodes/conditionAndBody/if/If";
import ForConditionPart from "./nodes/conditionAndBody/loop/ForConditionPart";
import Callable from "./nodes/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "./nodes/conditionAndBody/call/callable/ConditionPart";
import ArrayChunk from "./nodes/literal/array/ArrayChunk";
import ArrayItem from "./nodes/literal/array/ArrayItem";
import ObjectItem from "./nodes/literal/object/ObjectItem";
import ObjectChunk from "./nodes/literal/object/ObjectChunk";

export default class FxSerializer {


    deserialize(mainChunk, chunksData) {

        const buildAST = (chunk, data) => {

            for (let i = 0; i < data.length; i++) {

            }
        }

        buildAST(mainChunk, chunksData);
    }
}