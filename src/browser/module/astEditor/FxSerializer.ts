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
import ObjectItem from "./tab/chunks/literal/object/ObjectItem";
import ObjectChunk from "./tab/chunks/literal/object/ObjectChunk";

export default class FxSerializer {

    serialize(mainChunk: Main) { return mainChunk.serializeSubChunks(); }

    deserialize(mainChunk: Main, chunksData: any[]) {

        const deserializeIfChunk = (ifData): If => {
            const if_ = new If();
            buildAST(if_.getCondition(), ifData.condition);
            buildAST(if_.getBody(), ifData.body);

            return if_;
        }

        const deserializeForChunk = (chunkData): For => {
            const forChunk = new For();

            const condition = chunkData.condition;
            const body = chunkData.body;

            if (condition && condition.length > 0) {
                for (let i = 0; i < condition.length; i++) {

                    const forConditionPart = new ForConditionPart();
                    forChunk.insertInCondition(forConditionPart);
                    buildAST(forConditionPart, condition[i].internal);
                }
            }
            if (body && body.length > 0) {
                buildAST(forChunk.getBody(), body);
            }

            return forChunk;
        }
        const deserializeCallable = (chunkData) => {

            const callable = new Callable();

            const condition = chunkData.condition;
            const body = chunkData.body;

            if (condition && condition.length > 0) {
                for (let i = 0; i < condition.length; i++) {

                    if (!condition[i].internal) {
                        throw new Error('invalid data ' + JSON.stringify(condition[i]))
                    }

                    const conditionPart = new CallableConditionPart();
                    callable.insertInCondition(conditionPart);
                    buildAST(conditionPart, condition[i].internal);
                }
            }
            if (body && body.length > 0) buildAST(callable.getBody(), body);

            return callable;
        }
        const deserializeCall = (data) => {

        }
        const deserializeArrayChunk = (data) => {

            const array = new ArrayChunk();
            const body = data.body;

            if (!body) {
                throw new Error('invalid ArrayChunk data ' + JSON.stringify(data));
            }
            for (let i = 0; i < body.length; i++) {

                const arrayItem = new ArrayItem();
                buildAST(arrayItem, body[i].itemParts);

                array.insert(arrayItem);
            }

            return array;
        }
        const deserializeObjectChunk = (data) => {

            const object = new ObjectChunk();
            const body = data.body;

            if (!object) {
                throw new Error('invalid ObjectChunk data ' + JSON.stringify(data));
            }
            for (let i = 0; i < body.length; i++) {
                const objectItem = new ObjectItem;
                buildAST(objectItem.getKey(), body[i].k.itemParts);
                buildAST(objectItem.getValue(), body[i].v.itemParts);
                object.insert(objectItem);
            }

            return object;
        }


        const buildAST = (chunk, data) => {

            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                if (d.t === 'Name') {

                    const nameChunk = new Name(d.name);
                    if (d.mode === 'let') nameChunk.enableLet();
                    if (d.mode === 'new') nameChunk.enableNew();
                    chunk.insert(nameChunk);

                } else if (d.t === 'Op') {
                    chunk.insert(new Op(d.op));
                } else if (d.t === 'Literal') {
                    chunk.insert(new Literal(d.txt, d.type));
                } else if (d.t === 'NewLine') {
                    chunk.insert(new NewLine());
                } else if (d.t === 'If') {
                    chunk.insert(deserializeIfChunk(d));
                } else if (d.t === 'For') {
                    chunk.insert(deserializeForChunk(d));
                } else if (d.t === 'Callable') {
                    chunk.insert(deserializeCallable(d));
                } else if (d.t === 'ArrayChunk') {
                    chunk.insert(deserializeArrayChunk(d));
                } else if (d.t === 'ObjectChunk') {
                    chunk.insert(deserializeObjectChunk(d));
                } else {
                    throw new Error(`No handler for chunk [${d.t}].`)
                }
            }
        }

        buildAST(mainChunk, chunksData);
    }
}