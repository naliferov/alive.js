import Node from "../../../../type/Node.js";
import {uuid} from "../../../../F";

export default class AstNode {

    id;
    unit;

    constructor(txt = '', options = {}) {
        this.id = uuid();

        let classArr = ['ASTNode'];

        if (options.className && Array.isArray(options.className)) {
            classArr = [...options.className, ...classArr];
        } else if (options.className) classArr.push(options.className);

        this.unit = new Node({
            id: this.id,
            tagName: (options.tagName ? options.tagName: 'div'),
            class: classArr,
            name: txt,
        });
        if (options.hidden) this.unit.hide();

        window.astNodesPool.set(this.id, this);
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.constructor.name;
    }

    serialize() {
        return {
            t: this.constructor.name,
        }
    }

    serializeSubChunks() {
        const subChildren = this.getUnit().getDOM().children;
        const subChunks = [];

        for (let i = 0; i < subChildren.length; i++) {
            // @ts-ignore
            const chunk = window.astNodesPool.get(subChildren[i].id);
            if (chunk.constructor.name === 'Inserter') {
                continue;
            }

            subChunks.push(chunk.serialize());
        }

        return subChunks;
    }

    isEmpty() {
        return this.unit.getDOM().children.length === 0;
    }

    in(chunk) { this.insert(chunk) }
    insert(chunk) { this.unit.insert(chunk.getUnit()) }

    insertBefore(chunk, beforeChunk) {
        this.unit.insertBefore(chunk.getUnit(), beforeChunk.getUnit());
    }

    getParentChunk() {
        return window.astNodesPool.get(this.unit.getDOM().parentNode.id);
    }

    getParentNode() { return this.getParentChunk(); }

    getFirstChunk() {
        const first = this.unit.getDOM().firstChild;
        if (!first) return;
        // @ts-ignore
        return window.astNodesPool.get(first.id);
    }

    getLastChunk() {
        const last = this.unit.getDOM().lastChild
        if (!last) return;
        // @ts-ignore
        return window.astNodesPool.get(last.id);
    }

    getNextChunk() {
        const next = this.unit.getDOM().nextSibling;
        if (!next) return;
        // @ts-ignore
        return window.astNodesPool.get(next.id);
    }

    getPrevChunk() {
        const prev = this.unit.getDOM().previousSibling;
        if (!prev) return;
        // @ts-ignore
        return window.astNodesPool.get(prev.id);
    }

    getChildrenCount() {
        return this.unit.getDOM().children.length
    }
    getChildren() {
        return this.unit.getDOM().children
    }

    getUnit() { return this.unit }
    newLine() { this.unit.removeClass('inline') }
    mark() { this.unit.addClass('chunkSelected') }
    unmark() { this.unit.removeClass('chunkSelected') }
    show() { this.unit.show() }
    hide() { this.unit.hide() }
    remove() {
        this.unit.removeFromDom()
    }

    getTxt() {
        return this.unit.getTxt();
    }

    clearTxt() {
        this.unit.clear();
    }

    setTxt(txt) {
        this.unit.setTxt(txt);
    }

    iEditTxt() {
        this.unit.iEditMod();
    }

    oEditTxt() {
        this.unit.oEditMode();
    }

    toggleEditTxt() {
        this.unit.toggleEdit();
    }

    focus() {
        this.unit.focus();
    }

    toggleDisplay() { this.unit.toggleDisplay() }

    isShowed() { return this.unit.isShowed() }

    onControlBack(callback) {

        const handler = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                this.unit.off('keydown', handler);

                setTimeout(callback, 150);
            }
        }
        this.unit.on('keydown', handler);
    }

    iKeydown(fn) {
        this.unit.on('keydown', fn);
    }

    iKeydownDisable(fn) {
        this.unit.off('keydown', fn);
    }

    iKeyup(fn) {
        this.unit.on('keyup', fn);
    }

    iKeyupDisable(fn) {
        this.unit.off('keyup', fn);
    }

    visibilityHide() {
        this.unit.visibilityHide();
        return this;
    }
}