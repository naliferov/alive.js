import BaseNode from "../tab/nodes/BaseNode";
import Inserter from "../tab/nodes/mutate/Inserter";
import {FX_RUNTIME_GET_FOCUS} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPartInternal from "../tab/nodes/conditionAndBody/loop/ForConditionPartInternal";
import Main from "../tab/nodes/Main";
import FxController from "./FxController";
import Pubsub from "../../../../io/pubsub/Pubsub";
import ArrayItemParts from "../tab/nodes/literal/array/ArrayItemParts";

export default class FxMutatorFactory {

    pubsub: Pubsub

    constructor(pubsub: Pubsub) {
        this.pubsub = pubsub;
    }

    createMutator(fxController: FxController, contextChunk?: BaseNode) {

        const inserter = new Inserter();

        if (contextChunk) {
            inserter.setContextChunk(contextChunk);
            inserter.setTxt(contextChunk.getTxt());
            contextChunk.hide();
        }

        //todo make one method instead setInsertHandler and setNewChunkHandler
        //todo this.pubsub.pub(FX_RUNTIME_GET_FOCUS) doesn't make sense because method mark starts listen on keydown events
        inserter.setInsertHandler(async (newChunk: BaseNode, contextChunk?: BaseNode) => {

            inserter.getParentChunk().insertBefore(newChunk, inserter);
            fxController.removeChunk(inserter);
            if (contextChunk) fxController.removeChunk(contextChunk);

            fxController.unmarkAll().mark(newChunk);
            setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);

            await fxController.save();
        });
        inserter.setNewChunkHandler(async (newChunk) => {

            inserter.getParentChunk().insertBefore(newChunk, inserter);
            fxController.removeChunk(inserter);

            const newInserter = this.createMutator(fxController, contextChunk);

            const nextChunk = newChunk.getNextChunk();
            if (nextChunk) {
                newChunk.getParentChunk().insertBefore(newInserter, nextChunk);
            } else {
                newChunk.getParentChunk().insert(newInserter);
            }

            fxController.marker.unmarkAll().mark(newInserter);
            await fxController.save();
        });
        inserter.setExitHandler((contextChunk: BaseNode) => {

            if (contextChunk) contextChunk.show();

            const prevChunk = inserter.getPrevChunk();
            const parentChunk = inserter.getParentChunk();
            fxController.removeChunk(inserter);

            let chunk = prevChunk ? prevChunk : parentChunk;

            if (parentChunk instanceof ForConditionPartInternal) {

                const forConditionPart = parentChunk.getParentChunk();
                const prevForConditionPart = forConditionPart.getPrevChunk();
                const nextForConditionPart = forConditionPart.getNextChunk();

                if (parentChunk.isEmpty()) {

                    const For = forConditionPart.getParentChunk().getParentChunk();
                    forConditionPart.remove();

                    if (For.getCondition().isEmpty()) {
                        chunk = For;
                    } else {
                        chunk = prevForConditionPart ? prevForConditionPart.getLastChunk() : nextForConditionPart.getFirstChunk();
                    }

                } else if (prevChunk) {
                    chunk = prevChunk;
                } else {
                    chunk = forConditionPart;
                }

            } else if (parentChunk instanceof ArrayItemParts) {

                const arrayItem = parentChunk.getParentChunk();
                const prevArrayItem = arrayItem.getPrevChunk();
                const nextArrayItem = arrayItem.getNextChunk();
                const arrayBody = arrayItem.getParentChunk();

                if (parentChunk.isEmpty()) {
                    fxController.removeChunk(arrayItem);

                    if (arrayBody.isEmpty()) {
                        chunk = arrayBody.getParentChunk();
                    } else {
                        if (prevArrayItem) chunk = prevArrayItem;
                        if (nextArrayItem) chunk = nextArrayItem;
                    }

                } else if (prevChunk) {
                    chunk = prevChunk;
                } else {
                    chunk = arrayItem;
                }
            }

            fxController.unmarkAll();

            if (chunk && !(chunk instanceof Main)) {
                fxController.mark(chunk);
            }
            setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
        });

        return inserter;
    }

}