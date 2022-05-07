import AstNode from "../tab/nodes/AstNode";
import Inserter from "../tab/nodes/Inserter";
import {EDITING_AST_NODE, AST_CONTROL_MODE} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPartInternal from "../tab/nodes/conditionAndBody/loop/ForConditionPartInternal";
import Main from "../tab/nodes/Main";
import AstController from "./AstController";
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

const MODE_INSERT = 'insert';
const MODE_EDIT = 'edit';

export default class AstNodeEditor {

    pubsub: Pubsub;
    node: AstNode;
    mode;

    constructor(pubsub: Pubsub) {
        this.pubsub = pubsub;
    }

    createEditNode(fxController: AstController) {
        this.node = new Inserter();
        this.mode = MODE_INSERT;
        this.processNodeInput(this.node, fxController);
        return this.node;
    }

    editNode(node: AstNode, fxController: AstController) {

        if (node instanceof Name ||
            node instanceof Op
        ) {
            this.mode = MODE_EDIT;
            this.node = node;
            this.node.iEditTxt();
        } else {

            return;
        }

        this.pubsub.pub(EDITING_AST_NODE);
        this.processNodeInput(node, fxController);
    }

    async newChunkHandler(newChunk: AstNode, insertAgain: boolean = false, fxController: AstController) {

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

        setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);
        await fxController.save();
    }

    processNodeInput(node: AstNode, fxController: AstController) {

        let isCaretOnLastChar = false;

        const keyDown = (e) => {

            const key = e.key;
            if (key === 'Escape') {

                const prevChunk = node.getPrevChunk();
                const parentChunk = node.getParentChunk();
                let chunk;

                if (this.mode === MODE_INSERT) {

                    fxController.removeChunk(node);
                    chunk = prevChunk ? prevChunk: parentChunk;

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

                } else if (this.mode === MODE_EDIT) {

                    console.log('edit stop');
                    node.oEditTxt();
                    node.iKeydownDisable(keyDown);
                    node.iKeyupDisable(keyUp);
                    fxController.save();
                }

                this.mode = null;
                this.node = null;
                setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);
            }

        };
        const keyUp = (e) => {

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
        }

        node.iKeydown(keyDown);
        node.iKeyup(keyUp);
    }

    getNewChunkByTxt(t: string): AstNode {

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