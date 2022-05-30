export type UnitData = {
    id?: string
    tName?: string

    class?: string[]

    tagName?: string
    style?: { [key: string]: string }

    name?: string
    value?: string|number

    astNodes?: []
    nodes?: []
}

export default class T {

    data;
    dom;

    constructor(unitData = {}) { this.data = unitData; }
    getId() { return this.data.id; }

    setIdToDom(id: string) {
        this.getDOM().setAttribute('id', id);
    }
    getData(): UnitData { return this.data; }

    setDataField(k: string, v: any) {
        this.data[k] = v;
    }

    getDataField(k: string) {
        return this.data[k];
    }

    on(eventName: string, callback) {
        this.getDOM().addEventListener(eventName, callback);
    }

    off(eventName: string, callback) {
        this.getDOM().removeEventListener(eventName, callback);
    }

    getValue(): string|null {
        // @ts-ignore
        return this.getDOM().value;
    }

    setDOM(dom: HTMLElement) { this.dom = dom; }

    getDOM(): HTMLElement {
        if (this.dom) return this.dom;

        this.dom = document.createElement(this.data.tagName || 'div') as HTMLElement|HTMLInputElement;
        if (this.data.style) {
            for (let key in this.data.style) {
                this.dom.style[key] = this.data.style[key];
            }
        }
        if (this.data.id) this.dom.id = this.data.id;
        if (this.data.class) this.dom.className = this.data.class.join(' ');
        if (this.data.name) this.dom.innerText = this.data.name;
        // @ts-ignore
        if (this.data.value) this.dom.value = this.data.value;

        return this.dom;
    }

    getTxt() {
        return this.getDOM().innerText;
    }

    getText() {
        return this.getDOM().innerText;
    }

    setText(txt: string) {
        this.getDOM().innerText = txt;
    }

    setTxt(txt: string) {
        this.getDOM().innerText = txt;
    }

    setNameToData(txt: string) {
        this.data.name = txt;
    }

    setAttr(k: string, v: string) {
        this.getDOM().setAttribute(k, v);
        return this;
    }

    getAttr(k: string) {
        return this.getDOM().getAttribute(k);
    }

    getHtml(): string {
        return this.getDOM().innerHTML;
    }

    getName() {
        return this.data.name;
    }

    setName(name: string) {
        this.data.name = name;
    }

    setValueInData(v: string) {
        this.data.value = v;
    }

    insert(unit: T, index = null) {
        if (index !== null) {
            this.getDOM().insertBefore(unit.getDOM(), this.getDOM().children[index]);
            return;
        }

        this.getDOM().append(unit.getDOM());
    }

    in(unit: T, index = null) {
        this.insert(unit, index);
        return this;
    }

    inBr() {
        this.in(new T({tagName: 'br'}));
        return this;
    }

    insertBefore(unit: T, beforeUnit: T) {
        this.getDOM().insertBefore(unit.getDOM(), beforeUnit.getDOM());
    }

    addShift() {
        let dom = this.dom;
        let x = dom.style.left ? parseInt(dom.style.left.replace('px', ''), 10) : 0
        let newX = (x + 100) + 'px';

        this.data.style.left = newX;
        dom.style.left = newX;
    }

    setCoords(x: number = 0, y: number = 0) {

        if (!this.data.style) this.data.style = {};

        if (x) {
            this.data.style.left = x + 'px';
            this.dom.style.left = x + 'px';
        }
        if (y) {
            this.data.style.top = y + 'px';
            this.dom.style.top = y + 'px';
        }
    }

    setSizes(width, height) {
        if (width) this.dom.style.width = width + 'px';
        if (height) this.dom.style.height = height + 'px';
    }

    getSizes() {
        return this.dom.getBoundingClientRect()
    }

    getSizesAbsolute() {
        let sizes = this.dom.getBoundingClientRect();
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;

        return {
            bottom: sizes.bottom + scrollY,
            height: sizes.height,
            left: sizes.left + scrollX,
            right: sizes.right + scrollX,
            top: sizes.top + scrollY,
            width: sizes.width,
            x: sizes.x + scrollX,
            y: sizes.y + scrollY,
        }
    }

    select() {
        this.dom.style.border = '2px solid black';
        this.dom.style.padding = '4px';
    }

    unselect() {
        this.dom.style.border = '1px solid black';
        this.dom.style.padding = '5px';
    }

    addClass(className) {
        this.getDOM().classList.add(className);
    }

    hasClass(className: string): boolean {
        return this.dom.classList.contains(className);
    }

    removeClass(className) {
        this.getDOM().classList.remove(className);
    }

    isShowed() {
        return !this.getDOM().classList.contains('hidden');
    }

    isHidden() {
        return this.dom.classList.contains('hidden');
    }

    toggleDisplay() {
        this.getDOM().classList.toggle('hidden');
    }

    show() {
        this.getDOM().classList.remove('hidden');
    }

    hide() {
        this.getDOM().classList.add('hidden');
    }

    visibilityHide() {
        this.getDOM().classList.add('visibilityHidden');
    }

    removeFromDom() {
        this.dom.parentNode.removeChild(this.dom);
    }

    toggleEdit() {
        if (this.dom.contentEditable === 'true') {
            this.dom.removeAttribute('contentEditable');
            this.data.txt = this.dom.innerText;

            return false;
        } else {
            this.dom.contentEditable = 'true';
            this.dom.focus();

            return true;
        }
    }

    iEditMod() { this.getDOM().contentEditable = 'true' }
    oEditMode() { this.getDOM().contentEditable = 'false' }

    toggleView() {
        this.dom.classList.toggle('hidden');
    }

    focus() {
        this.getDOM().focus();
    }

    clear() {
        this.getDOM().innerHTML = '';
    }

    getNodes() {
        return this.data.nodes;
    }
}