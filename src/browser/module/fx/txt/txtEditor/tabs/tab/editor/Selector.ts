import U from "../../../../../../../core/U";
import Cursor from "./Cursor";

export default class Selector {

    unit: U;

    cursor: Cursor;
    lines: U;

    active: boolean = false;
    referencePos: {x: number, y: number}|null;

    order: string = '';

    constructor(lines: U, cursor: Cursor) {
        this.unit = new U({class: ['selectorContainer']});
        this.lines = lines;
        this.cursor = cursor;
    }

    renderSelection() {
        this.unit.clear();

        let newCursorPos = {x: this.cursor.x, y: this.cursor.y};
        const refPos = this.referencePos;

        const renderLine = (min: number, max: number, y: number) => {

            if (min === max) {

                const selector = new U({class: ['selector'], style: {height: this.cursor.yStep + 'px'}});
                selector.getDOM().style['top'] = this.cursor.yStep * y + 'px';

                if (refPos.x < newCursorPos.x) {
                    selector.getDOM().style['margin-left'] = this.cursor.xStep * refPos.x + 'px';
                    selector.getDOM().style['width'] = this.cursor.xStep * (newCursorPos.x - refPos.x) + 'px';
                    this.unit.insert(selector);
                } else if (refPos.x > newCursorPos.x) {
                    selector.getDOM().style['margin-left'] = this.cursor.xStep * newCursorPos.x + 'px';
                    selector.getDOM().style['width'] = this.cursor.xStep * (refPos.x - newCursorPos.x) + 'px';
                    this.unit.insert(selector);
                } else {
                    this.unit.clear();
                    this.active = false;
                }
                return;
            }

            const selector = new U({class: ['selector'], style: {height: this.cursor.yStep + 'px'}});
            const linesSizes = this.lines.getSizesAbsolute();

            if (y === min) {
                const shift = this.order === 'right' ? refPos.x : newCursorPos.x;
                selector.getDOM().style['top'] = this.cursor.yStep * y + 'px';
                selector.getDOM().style['margin-left'] = this.cursor.xStep * shift + 'px';
                selector.getDOM().style['width'] = linesSizes.width + 'px';
            } else if (y === max) {
                const shift = this.order === 'right' ? newCursorPos.x : refPos.x;
                selector.getDOM().style['top'] = this.cursor.yStep * y + 'px';
                selector.getDOM().style['width'] = this.cursor.xStep * shift  + 'px';
            } else {
                selector.getDOM().style['top'] = this.cursor.yStep * y + 'px';
                selector.getDOM().style['width'] = linesSizes.width + 'px';
            }
            this.unit.insert(selector);
        }

        const diff = Math.abs(refPos.y - newCursorPos.y);
        if (diff) {
            const min = refPos.y < newCursorPos.y ? refPos.y : newCursorPos.y;
            const max = refPos.y < newCursorPos.y ? newCursorPos.y : refPos.y;
            for (let i = min; i <= max; i++) renderLine(min, max, i);
        } else {
            renderLine(refPos.y, newCursorPos.y, refPos.y);
        }
    }

    getUnit() {
        return this.unit;
    }

    setShift(x, y) {
        const dom = this.unit.getDOM();
        dom.style.left = x + 'px';
        dom.style.top = y + 'px';
    }

    up() {
        if (!this.active) this.activate('left')
        this.renderSelection();
    }

    down() {
        if (!this.active) this.activate('right');
        this.renderSelection();
    }

    left() {
        if (!this.active) this.activate('left');
        this.renderSelection();
    }

    right() {
        if (!this.active) this.activate('right');
        this.renderSelection();
    }

    activate(order: string) {
        this.referencePos = { ...this.cursor.getPos() };
        this.active = true;
        this.order = order;
    }

    reset() {
        this.active = false;
        this.unit.clear();
        this.order = null;
    }

    enable() {
        this.unit.show();
    }

    disable() {
        this.unit.hide();
    }
}