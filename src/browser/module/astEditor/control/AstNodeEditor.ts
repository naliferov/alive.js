import AstNode from "../nodes/AstNode";
import Inserter from "../nodes/Inserter";
import {AST_NODE_EDIT_MODE, AST_CONTROL_MODE} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPartInternal from "../nodes/conditionAndBody/loop/ForConditionPartInternal";
import Main from "../nodes/Main";
import AstController from "./AstController";
import Pubsub from "../../../../io/pubsub/Pubsub";
import Name from "../nodes/literal/Name";
import Op from "../nodes/Op";
import If from "../nodes/conditionAndBody/if/If";
import For from "../nodes/conditionAndBody/loop/For";
import Call from "../nodes/conditionAndBody/call/call/Call";
import Callable from "../nodes/conditionAndBody/call/callable/Callable";
import ArrayChunk from "../nodes/literal/array/ArrayChunk";
import ObjectChunk from "../nodes/literal/object/ObjectChunk";
import Literal from "../nodes/literal/Literal";
import ArrayItemParts from "../nodes/literal/array/ArrayItemParts";

const MODE_INSERT = 'insert';
const MODE_EDIT = 'edit';

export default class AstNodeEditor {

    pubsub: Pubsub;
    node: AstNode;
    mode;

    constructor(pubsub: Pubsub) {
        this.pubsub = pubsub;
    }

    resetState() {
        this.node = null;
        this.mode = null;
    }

    createEditNode(fxController: AstController) {
        this.node = new Inserter();
        this.mode = MODE_INSERT;
        this.node.iEditTxt();

        this.processNodeInput(this.node, fxController);
        return this.node;
    }

    editNode(node: AstNode, fxController: AstController) {

        if (node instanceof Name ||
            node instanceof Op ||
            node instanceof Literal
        ) {
            this.mode = MODE_EDIT;
            this.node = node;
            this.node.iEditTxt();
        } else return;

        this.pubsub.pub(AST_NODE_EDIT_MODE);
        this.processNodeInput(node, fxController);
    }

    async insertNewChunk(newChunk: AstNode, insertAgain: boolean = false, fxController: AstController) {

        const node = this.node;

        node.getParentChunk().insertBefore(newChunk, node);
        fxController.removeChunk(node);
        fxController.unmarkAll().mark(newChunk);
        fxController.save();

        //todo удалить inserter если контроль получает AST_CONTROL_MODE

        if (insertAgain) {
            const newInserter = this.createEditNode(fxController);
            const nextChunk = newChunk.getNextChunk();
            if (nextChunk) {
                newChunk.getParentChunk().insertBefore(newInserter, nextChunk);
            } else {
                newChunk.getParentChunk().insert(newInserter);
            }

            fxController.unmarkAll().mark(newInserter);
            newInserter.focus();
        }
    }

    processNodeInput(node: AstNode, fxController: AstController) {

        let isCaretOnLastChar = false;

        const keyDown = (e) => {

            const key = e.key;

            const offset = document.getSelection().focusOffset;
            const text = this.node.getTxt();
            isCaretOnLastChar = offset && text.trim().length > 0 && text.length === offset;

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

                this.resetState();
                setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);
            } else if (key === 'Enter') {

                e.preventDefault();

                if (this.mode === MODE_INSERT) {
                    const chunk = this.getNewChunkByTxt(this.node.getTxt());
                    if (chunk) this.insertNewChunk(chunk, false, fxController);
                } else if (this.mode === MODE_EDIT) {
                    console.log('edit stop');
                    node.oEditTxt();
                    node.iKeydownDisable(keyDown);
                    node.iKeyupDisable(keyUp);
                }

                setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);
                fxController.save();
                return;
            }

        };
        const keyUp = (e) => {
            const isArrowRight = e.key === 'ArrowRight';
            const isSpace = e.key === ' ';
            if (isCaretOnLastChar && (isArrowRight || isSpace)) {
                const chunk = this.getNewChunkByTxt(this.node.getTxt());
                if (chunk) this.insertNewChunk(chunk, true, fxController);
            }
        }

        node.iKeydown(keyDown);
        node.iKeyup(keyUp);
    }

    getNewChunkByTxt(t: string): AstNode {

        if (!t.length) return;

        t = t.trim();

        if (t === '=') return new Op('=');
        if (t === '==') return new Op('==');
        if (t === '===') return new Op('===');
        if (t === '!') return new Op('!');
        if (t === '+') return new Op('+');
        if (t === '++') return new Op('++');
        if (t === '-') return new Op('-');
        if (t === '--') return new Op('--');
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