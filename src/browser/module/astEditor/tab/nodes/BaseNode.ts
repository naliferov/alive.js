import T from "../../../../../T";
import {uuid} from "../../../../../F";
import Inserter from "./Inserter";

export default class BaseNode {

    id: string
    unit: T;

    constructor(txt = '', options: any = {}) {
        this.id = uuid();

        let classArr = ['fx'];

        if (options.className && Array.isArray(options.className)) {
            classArr = [...options.className, ...classArr];
        } else if (options.className) classArr.push(options.className);

        this.unit = new T({
            id: this.id,
            tagName: (options.tagName ? options.tagName: 'div'),
            class: classArr,
            txt,
        });
        if (options.hidden) this.unit.hide();

        // @ts-ignore
        window.chunkPool.set(this.id, this);
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.constructor.name;
    }

    serialize(): object {
        return {
            t: this.constructor.name,
        }
    }

    serializeSubChunks() {
        const subChildren = this.getUnit().getDOM().children;
        const subChunks = [];

        for (let i = 0; i < subChildren.length; i++) {
            // @ts-ignore
            const chunk = window.chunkPool.get(subChildren[i].id);
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

    insert(chunk: BaseNode) { this.unit.insert(chunk.getUnit()) }
    insertBefore(chunk: BaseNode, beforeChunk: BaseNode) {
        this.unit.insertBefore(chunk.getUnit(), beforeChunk.getUnit());
    }

    getParentChunk() {
        // @ts-ignore
        return window.chunkPool.get(this.unit.getDOM().parentNode.id);
    }

    getParentUnit() {
        return new T({}, this.unit.getDOM().parentNode);
    }

    getFirstChunk() {
        const first = this.unit.getDOM().firstChild;
        if (!first) return;
        // @ts-ignore
        return window.chunkPool.get(first.id);
    }

    getLastChunk() {
        const last = this.unit.getDOM().lastChild
        if (!last) return;
        // @ts-ignore
        return window.chunkPool.get(last.id);
    }

    getNextChunk() {
        const next = this.unit.getDOM().nextSibling;
        if (!next) return;
        // @ts-ignore
        return window.chunkPool.get(next.id);
    }

    getPrevChunk() {
        const prev = this.unit.getDOM().previousSibling;
        if (!prev) return;
        // @ts-ignore
        return window.chunkPool.get(prev.id);
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
    remove() { this.unit.removeFromDom() }

    getTxt() {
        return this.unit.getTxt();
    }

    clearTxt() {
        this.unit.clear();
    }

    setTxt(txt) {
        this.unit.setText(txt);
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

    iKeyup(fn) {
        this.unit.on('keyup', fn);
    }

    visibilityHide() {
        this.unit.visibilityHide();
        return this;
    }

    /*oKeyUp(fn) {
        this.unit.off('keyup', fn);
    }*/
    /*keyup(fn) {

    }*/
}