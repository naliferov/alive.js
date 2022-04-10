import MainChunk from "./chunks/MainChunk";
import Name from "./chunks/literal/Name";
import Op from "./chunks/Op";
import Literal from "./chunks/literal/Literal";
import NewLine from "./chunks/NewLine";
import For from "./chunks/conditionAndBody/loop/For";
import If from "./chunks/conditionAndBody/if/If";
import ForConditionPart from "./chunks/conditionAndBody/loop/ForConditionPart";
import Callable from "./chunks/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "./chunks/conditionAndBody/call/callable/ConditionPart";

export default class FxSerializer {

    serialize(mainChunk: MainChunk) { return mainChunk.serializeSubChunks(); }

    deserialize(mainChunk: MainChunk, chunksData: any[]) {

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

                    const conditionPart = new CallableConditionPart();
                    callable.insertInCondition(conditionPart);
                    buildAST(conditionPart, condition[i].internal);
                }
            }
            if (body && body.length > 0) buildAST(callable.getBody(), body);

            return callable;
        }
        const deserializeCall = () => {}



        const buildAST = (chunk, data) => {

            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                if (d.t === 'Name') {

                    const nameChunk = new Name(d.name);
                    if (d.isLet) nameChunk.toggleLetDisplay();
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
                } else {
                    throw new Error(`No handler for chunk [${d.t}].`)
                }
            }
        }

        buildAST(mainChunk, chunksData);
    }
}