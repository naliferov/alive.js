export interface UnitData {
    id?: string
    class?: string[]
    name?: string

    tagName?: string
    style?: { [key: string]: string }

    txt?: string
    value?: string|number
    fx?: {}

    open?: boolean
    units?: []
    linkId?: string
}

export default class U {

    data: UnitData;
    dom: HTMLElement|HTMLInputElement = null;
    observer: MutationObserver;

    constructor(unitData: UnitData, dom: any = null) {

        let self = this;
        this.data = unitData;
        if (dom) this.dom = dom;

        self['.'] = (...className) => {
            for (let i = 0; i < className.length; i++) this.dom.classList.add(className[i]);
        }
        self['<'] = (tagName) => {
            //if (!self.data.view) self.data.view = {}
            //self.data.view.tagName = tagName
            return self
        }
        self['>'] = (txt) => {
            //self.setText(txt)
            return self
        }
    }

    getId(): string {
        return this.data.id;
    }

    setIdToDom(id: string) {
        this.getDOM().setAttribute('id', id);
    }

    getData(): UnitData {
        return this.data;
    }

    setDataField(k: string, v: any) {
        this.data[k] = v;
    }

    getDataField(k: string) {
        return this.data[k];
    }

    getById() {

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
        if (this.data.txt) this.dom.innerText = this.data.txt;
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

    setTxtToData(txt: string) {
        this.data.txt = txt;
    }

    setAttr(k: string, v: string) {
        this.getDOM().setAttribute(k, v);
    }

    getAttr(k: string) {
        return this.getDOM().getAttribute(k);
    }

    getHtml(): string {
        return this.getDOM().innerHTML;
    }

    getName(): string|undefined {
        return this.data.name;
    }

    setName(name: string) {
        this.data.name = name;
    }

    setValueInData(v: string) {
        this.data.value = v;
    }

    insert(unit: U, index = null) {
        if (index !== null) {
            this.getDOM().insertBefore(unit.getDOM(), this.getDOM().children[index]);
            return;
        }

        this.getDOM().append(unit.getDOM());
    }

    in(unit: U, index = null) {
        this.insert(unit, index);
    }

    inBr() {
        this.in(new U({tagName: 'br'}));
    }

    insertBefore(unit: U, beforeUnit: U) {
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

    iEditMod() { this.dom.contentEditable = 'true' }
    oEditMode() { this.dom.contentEditable = 'false' }

    toggleView() {
        this.dom.classList.toggle('hidden');
    }

    focus() {
        this.getDOM().focus();
    }

    clear() {
        this.getDOM().innerHTML = '';
    }

    isOpen() {
        return this.data.open
    }

    setOpen() {
        this.data.open = true;
    }

    setClose() {
        delete this.data.open;
    }

    observeStart() {
        this.observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName !== 'style') {
                    continue;
                }
                const width = this.getDOM().style.width
                const height = this.getDOM().style.height
                if (width) this.data.style.width = width;
                if (height) this.data.style.height = height;
            }
        });
        this.observer.observe(this.getDOM(), { attributes: true });
    }

    observeStop() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    makeMoveble() {
        this.getDOM().style.position = 'absolute';
    }

    /*disableEdit() {
        this.dom.contentEditable = undefined;
    }*/

    getUnits() {
        return this.data.units;
    }
}