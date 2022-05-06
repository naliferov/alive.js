import BaseNode from "../tab/nodes/BaseNode";
import Inserter from "../tab/nodes/Inserter";
import {EDITING_AST_NODE, FX_RUNTIME_GET_FOCUS} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPartInternal from "../tab/nodes/conditionAndBody/loop/ForConditionPartInternal";
import Main from "../tab/nodes/Main";
import FxController from "./FxController";
import Pubsub from "../../../../io/pubsub/Pubsub";
import Name from "../tab/nodes/literal/Name";
import Op from "../tab/nodes/Op";
import If from "../tab/nodes/conditionAndBody/if/If";
import For from "../tab/nodes/conditionAndBody/loop/For";
import Call from "../tab/nodes/conditionAndBody/call/call/Call";
import Callable from "../tab/nodes/conditionAndBody/call/callable/Callable";
import ArrayChunk from "../tab/nodes/literal/array/ArrayChunk";
import ObjectChunk from "../tab/nodes/literal/object/ObjectChunk";
import Literal from "../tab/nodes/literal/Literal";
import ArrayItemParts from "../tab/nodes/literal/array/ArrayItemParts";

export default class AstNodeEditor {

    pubsub: Pubsub;
    node: BaseNode;
    mode;

    constructor(pubsub: Pubsub) {
        this.pubsub = pubsub;
    }

    createEditNode(fxController: FxController) {
        this.node = new Inserter();
        this.processNodeInput(this.node, fxController);
        return this.node;
    }

    editNode(node: BaseNode, fxController: FxController) {

        if (node instanceof Name ||
            node instanceof Op
        ) {
            this.mode = 'edit';
            this.node = node;
            this.node.iEditTxt();
        } else {
            return;
        }

        this.pubsub.pub(EDITING_AST_NODE);
        this.processNodeInput(node, fxController);
    }

    async newChunkHandler(newChunk: BaseNode, insertAgain: boolean = false, fxController: FxController) {

        const node = this.node;

        node.getParentChunk().insertBefore(newChunk, node);
        fxController.removeChunk(node);
        fxController.unmarkAll().mark(newChunk);

        if (insertAgain) {
            const newInserter = this.createEditNode(fxController);
            const nextChunk = newChunk.getNextChunk();
            if (nextChunk) {
                newChunk.getParentChunk().insertBefore(newInserter, nextChunk);
            } else {
                newChunk.getParentChunk().insert(newInserter);
            }
            fxController.unmarkAll().mark(newInserter);
        }

        setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
        await fxController.save();
    }

    processNodeInput(node: BaseNode, fxController: FxController) {

        //setTimeout(() => this.iEditTxt(), 150);

        node.iKeydown((e) => {

            if (e.key === 'Escape') {

                const inserter = node;

                const prevChunk = inserter.getPrevChunk();
                const parentChunk = inserter.getParentChunk();

                if (this.mode !== 'edit') {
                    fxController.removeChunk(inserter);
                }

                return;

                let chunk = prevChunk ? prevChunk: parentChunk;

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

            } else if (e.key === 'Enter') {

                const prevNode = node.getPrevChunk();
                const parentNode = node.getParentChunk();
                fxController.removeChunk(node);

                let markIt = prevNode ? prevNode : parentNode;

                if (parentNode instanceof ForConditionPartInternal) {

                    const forConditionPart = parentNode.getParentChunk();
                    const prevForConditionPart = forConditionPart.getPrevChunk();
                    const nextForConditionPart = forConditionPart.getNextChunk();

                    if (parentNode.isEmpty()) {

                        const For = forConditionPart.getParentChunk().getParentChunk();
                        forConditionPart.remove();

                        if (For.getCondition().isEmpty()) {
                            markIt = For;
                        } else {
                            markIt = prevForConditionPart ? prevForConditionPart.getLastChunk() : nextForConditionPart.getFirstChunk();
                        }

                    } else if (parentNode) {
                        markIt = parentNode;
                    } else {
                        markIt = forConditionPart;
                    }

                } else if (parentNode instanceof ArrayItemParts) {

                    const arrayItem = parentNode.getParentChunk();
                    const prevArrayItem = arrayItem.getPrevChunk();
                    const nextArrayItem = arrayItem.getNextChunk();
                    const arrayBody = arrayItem.getParentChunk();

                    if (parentNode.isEmpty()) {
                        fxController.removeChunk(arrayItem);

                        if (arrayBody.isEmpty()) {
                            markIt = arrayBody.getParentChunk();
                        } else {
                            if (prevArrayItem) markIt = prevArrayItem;
                            if (nextArrayItem) markIt = nextArrayItem;
                        }

                    } else if (prevNode) {
                        markIt = prevNode;
                    } else {
                        markIt = arrayItem;
                    }
                }

                fxController.unmarkAll();

                if (markIt && !(markIt instanceof Main)) {
                    fxController.mark(markIt);
                }
                setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
                e.preventDefault();
            }

        });


        let isCaretOnLastChar = false;

        this.node.iKeyup((e) => {

            const isArrowRight = e.key === 'ArrowRight';
            const isSpace = e.key === ' ';

            const text = this.node.getTxt();
            const offset = document.getSelection().focusOffset;

            if (isSpace && isCaretOnLastChar) {
                const chunk = this.getNewChunkByTxt(text.trim());
                if (chunk) this.newChunkHandler(chunk, true, fxController);
                return;
            }

            console.log('caretOffset', offset, text.length);

            if (offset < text.length) {
                isCaretOnLastChar = false;
            } else if (offset && text.trim().length > 0 && text.length === offset) {

                if (isCaretOnLastChar) {
                    const chunk = this.getNewChunkByTxt(text.trim());
                    if (chunk && isArrowRight) {
                        this.newChunkHandler(chunk, true, fxController);
                    }
                    return;
                }

                isCaretOnLastChar = true;
                return;
            }
        })
    }

    getNewChunkByTxt(t: string): BaseNode {

        if (!t.length) return;

        if (t === '=') return new Op('=');
        if (t === '==') return new Op('==');
        if (t === '===') return new Op('===');
        if (t === '!') return new Op('!');
        if (t === '+') return new Op('+');
        if (t === '-') return new Op('-');
        if (t === '*') return new Op('*');
        if (t === '/') return new Op('/');
        if (t === '>') return new Op('>');
        if (t === '>=') return new Op('>=');
        if (t === '<') return new Op('<');
        if (t === '<=') return new Op('<=');

        if (t === 'if') return new If();
        if (t === 'for') return new For();
        if (t === '()') return new Call();
        if (t === '=>') return new Callable();

        //todo if prev element isName this is dynamic object usage else array creation
        if (t === '[') return new ArrayChunk();
        if (t === '{') return new ObjectChunk();

        const num = Number(t);
        if (!isNaN(num)) return new Literal(t, 'number');
        if (t[0] === "'") return new Literal(t, 'string');

        //creating object, array, NameOfProp

        return new Name(t);
    }

}