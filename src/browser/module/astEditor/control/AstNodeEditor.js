import Inserter from "../nodes/Inserter.js";
import ForConditionPartInternal from "../nodes/conditionAndBody/loop/ForConditionPartInternal.js";
import Main from "../nodes/Main.js";
import Id from "../nodes/id/Id.js";
import Keyword from "../nodes/Keyword.js";
import Op from "../nodes/Op.js";
import If from "../nodes/conditionAndBody/if/If.js";
import For from "../nodes/conditionAndBody/loop/For.js";
import Call from "../nodes/conditionAndBody/call/call/Call.js";
import Callable from "../nodes/conditionAndBody/call/callable/Callable.js";
import ArrayChunk from "../nodes/literal/array/ArrayChunk.js";
import ObjectChunk from "../nodes/literal/object/ObjectChunk.js";
import Literal from "../nodes/literal/Literal.js";
import ArrayItemParts from "../nodes/literal/array/ArrayItemParts.js";

const MODE_INSERT = 'insert';
const MODE_EDIT = 'edit';

export default class AstNodeEditor {

    node;
    mode;

    resetState() {
        this.node = null;
        this.mode = null;
    }

    createEditNode(fxController) {
        this.node = new Inserter();
        this.mode = MODE_INSERT;
        this.node.iEditTxt();

        this.processNodeInput(this.node, fxController);
        return this.node;
    }

    editNode(node, fxController) {

        if (node instanceof Id ||
            node instanceof Op ||
            node instanceof Literal
        ) {
            this.mode = MODE_EDIT;
            this.node = node;
            this.node.iEditTxt();
        } else return;

        e('astNodeEditMode');
        this.processNodeInput(node, fxController);
    }

    insertNewChunk(newChunk, insertAgain = false, astEditor) {

        const node = this.node;

        e('>after', [newChunk.getV(), node.getV()]);
        astEditor.removeChunk(node);
        astEditor.unmarkAll().mark(newChunk);

        if (insertAgain) {
            const newInserter = this.createEditNode(astEditor);
            const nextChunk = newChunk.getNextChunk();
            if (nextChunk) {
                newChunk.getParentChunk().insertBefore(newInserter, nextChunk);
            } else {
                newChunk.getParentChunk().insert(newInserter);
            }

            astEditor.unmarkAll().mark(newInserter);
            newInserter.focus();
        }
    }

    processNodeInput(node, fxController) {

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
                setTimeout(() => window.e('astControlMode'), 300);
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

                setTimeout(() => window.e('astControlMode'), 300);
                fxController.save();
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

    getNewChunkByTxt(t) {

        if (!t.length) return;

        t = t.trim();

        if (t === 'return') return new Keyword('return');
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
        if (t === '(') return new Call();
        if (t === '=>') return new Callable();
        if (t === '[') return new ArrayChunk();
        if (t === '{') return new ObjectChunk();

        const num = Number(t);
        if (!isNaN(num)) return new Literal(t, 'number');
        if (t[0] === "'") return new Literal(t, 'string');

        return new Id(t);
    }

}