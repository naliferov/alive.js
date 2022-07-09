import {uuid} from "../../../../F.js";
import V from "../../../../type/V.js";

export default class AstNode {

    id;
    v;

    constructor(txt = '', options = {}) {
        this.id = uuid();

        let classArr = ['ASTNode'];

        if (options.className && Array.isArray(options.className)) {
            classArr = [...options.className, ...classArr];
        } else if (options.className) classArr.push(options.className);

        this.v = new V({
            id: this.id,
            tagName: (options.tagName ? options.tagName: 'div'),
            class: classArr,
            txt,
        });
        if (options.hidden) this.v.hide();

        window.astPool.set(this.id, this);
    }

    getId() { return this.id; }
    getName() { return this.constructor.name; }

    serialize() {
        return {
            t: this.constructor.name,
        }
    }

    serializeSubChunks() {
        const subChildren = this.v.getDOM().children;
        const subChunks = [];

        for (let i = 0; i < subChildren.length; i++) {
            const chunk = window.astPool.get(subChildren[i].id);
            if (chunk.constructor.name === 'Inserter') {
                continue;
            }
            subChunks.push(chunk.serialize());
        }

        return subChunks;
    }

    isEmpty() {
        return this.v.getDOM().children.length === 0;
    }

    in(chunk) { this.insert(chunk) }
    insert(chunk) {
        e('>', [chunk.getV(), this.v]);
    }

    insertBefore(chunk, beforeChunk) {
        //console.log('insertBefore', chunk, beforeChunk);
        //this.v.insertBefore(chunk.getV(), beforeChunk.getUnit());
    }

    getParentChunk() {
        return window.astPool.get(this.v.getDOM().parentNode.id);
    }
    getParentNode() { return this.getParentChunk(); }

    getFirstChunk() {
        const first = this.v.getDOM().firstChild;
        if (!first) return;
        return window.astPool.get(first.id);
    }

    getLastChunk() {
        const last = this.v.getDOM().lastChild
        if (!last) return;
        return window.astPool.get(last.id);
    }

    getNextChunk() {
        const next = this.v.getDOM().nextSibling;
        if (!next) return;
        return window.astPool.get(next.id);
    }

    getPrevChunk() {
        const prev = this.v.getDOM().previousSibling;
        if (!prev) return;
        return window.astPool.get(prev.id);
    }

    getChildrenCount() { return this.v.getDOM().children.length }
    getChildren() { return this.v.getDOM().children }

    getV() { return this.v }
    newLine() { this.v.removeClass('inline') }
    mark() { this.v.addClass('chunkSelected') }
    unmark() { this.v.removeClass('chunkSelected') }
    show() { this.v.show() }
    hide() { this.v.hide() }
    remove() { this.v.removeFromDom() }
    getTxt() { return this.v.getTxt(); }
    setTxt(txt) { this.v.setTxt(txt); }
    iEditTxt() { this.v.iEditMod(); }
    oEditTxt() { this.v.oEditMode(); }
    toggleEditTxt() { this.v.toggleEdit(); }
    focus() { this.v.focus(); }
    toggleDisplay() { this.v.toggleDisplay() }
    isShowed() { return this.v.isShowed() }

    clear() { this.v.clear(); }

    onControlBack(callback) {

        const handler = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                this.v.off('keydown', handler);

                setTimeout(callback, 150);
            }
        }
        this.v.on('keydown', handler);
    }

    iKeydown(fn) { this.v.on('keydown', fn); }
    iKeydownDisable(fn) { this.v.off('keydown', fn); }
    iKeyup(fn) { this.v.on('keyup', fn); }
    iKeyupDisable(fn) { this.v.off('keyup', fn); }
    visibilityHide() { this.v.visibilityHide(); }
}