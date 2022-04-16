import BaseChunk from "../BaseChunk";
import Op from "../Op";
import Literal from "../literal/Literal";
import Name from "../literal/Name";
import If from "../conditionAndBody/if/If";
import For from "../conditionAndBody/loop/For";
import Call from "../conditionAndBody/call/call/Call";
import Callable from "../conditionAndBody/call/callable/Callable";
import ArrayChunk from "../literal/array/ArrayChunk";
import ObjectChunk from "../literal/object/ObjectChunk";

export default class Inserter extends BaseChunk {

    insertHandler;
    exitHandler;
    newChunkHandler;

    contextChunk: BaseChunk;

    constructor() {
        super('', {className: 'inserter'});
    }

    setInsertHandler(handler) { this.insertHandler = handler; }
    setExitHandler(handler) { this.exitHandler = handler; }
    setNewChunkHandler(handler) { this.newChunkHandler = handler; }
    setContextChunk(chunk: BaseChunk) { this.contextChunk = chunk; }

    getNewChunkByTxt(t: string): BaseChunk {

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

        //todo if prev element isName this is name usage else array creation
        if (t === '[') return new ArrayChunk();
        //if (t === '{') return new ObjectChunk();

        const num = Number(t);
        if (!isNaN(num)) return new Literal(t, 'number');
        if (t[0] === "'") return new Literal(t, 'string');

        //creating object, array, NameOfProp

        const name = new Name(t);
        if (this.contextChunk instanceof Name && this.contextChunk.isLet()) {
            name.enableLet();
        }

        return name;
    }

    mark() {
        setTimeout(() => this.iEditTxt(), 150);

        this.iKeydown((e) => {

            if (e.key === 'Escape') { this.exitHandler(this.contextChunk); return; }
            if (e.key === 'Enter') {
                e.preventDefault();

                const chunk = this.getNewChunkByTxt(this.getTxt().trim());
                if (chunk) this.insertHandler(chunk, this.contextChunk);
            }
        });

        let isCaretOnLastChar = false;

        this.iKeyup((e) => {

            const isArrowRight = e.key === 'ArrowRight';
            const isSpace = e.key === ' ';

            const text = this.getTxt();
            const offset = document.getSelection().focusOffset;

            if (isSpace) {
                const chunk = this.getNewChunkByTxt(text.trim());
                if (chunk) this.newChunkHandler(chunk);
                return;
            }

            if (offset < text.length) {
                isCaretOnLastChar = false;
            } else if (offset && text.trim().length > 0 && text.length === offset) {

                if (isCaretOnLastChar) {
                    const chunk = this.getNewChunkByTxt(text.trim());
                    if (chunk && isArrowRight) {
                        this.newChunkHandler(chunk);
                    }
                    return;
                }

                isCaretOnLastChar = true;
                return;
            }
        })

        super.mark();
    }
}