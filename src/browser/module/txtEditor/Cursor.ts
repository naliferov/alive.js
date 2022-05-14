import T from "../../../type/T";

export default class Cursor {

    unit: T;

    x: number;
    y: number;

    yStep: number;
    xStep: number;

    blinking;

    changeCursorPosHandler;

    constructor() {
        this.unit = new T({class: ['cursor'], style: {width: '1px', height: '18px', background: 'black', position: 'absolute', 'z-index': '3'}});

        this.x = 0;
        this.y = 0;

        this.xStep = 8.40;
        this.yStep = 18;
    }


    getUnit() {
        return this.unit;
    }

    getPos() {
        return {x: this.x, y: this.y};
    }

    setShift(x, y) {
        const dom = this.unit.getDOM();
        dom.style.left = x + 'px';
        dom.style.top = y + 'px';
    }

    setPos(x = null, y = null) {
        if (x !== null) {
            this.x = x;
            this.unit.getDOM().style['margin-left'] = (this.xStep * this.x) + 'px';
        }
        if (y !== null) {
            this.y = y;
            this.unit.getDOM().style['margin-top'] = (this.yStep * this.y) + 'px';
        }
        if (this.changeCursorPosHandler) this.changeCursorPosHandler(this.getPos());
    }

    up() {
        //this.pauseBlinking();
        if ((this.y - 1) < 0) return;
        this.unit.getDOM().style['margin-top'] = (this.yStep * --this.y) + 'px';
        //this.startBlinking();
        if (this.changeCursorPosHandler) this.changeCursorPosHandler(this.getPos());
    }

    down() {
        //this.pauseBlinking();
        this.unit.getDOM().style['margin-top'] = (this.yStep * ++this.y) + 'px';
        //this.startBlinking();
        if (this.changeCursorPosHandler) this.changeCursorPosHandler(this.getPos());
    }

    left() {
        //this.pauseBlinking();
        this.unit.getDOM().style['margin-left'] = (this.xStep * --this.x) + 'px';
        //this.startBlinking();
        if (this.changeCursorPosHandler) this.changeCursorPosHandler(this.getPos());
    }

    right() {
        //this.pauseBlinking();
        this.unit.getDOM().style['margin-left'] = (this.xStep * ++this.x) + 'px';
        //this.startBlinking();
        if (this.changeCursorPosHandler) this.changeCursorPosHandler(this.getPos());
    }

    enable() {
        this.unit.show();
    }

    disable() {
        this.unit.hide();
    }

    startBlinking() {
        if (this.blinking) return;
        this.blinking = setInterval(() => {
            this.unit.isShowed() ? this.unit.hide() : this.unit.show();
        }, 400);
    }

    pauseBlinking() {
        clearInterval(this.blinking);
        this.blinking = null;
        this.unit.show();
    }

    stopBlinking() {
        clearInterval(this.blinking);
        this.blinking = null;
        this.unit.hide();
    }

    onChangeCursorPosition(handler) {
        this.changeCursorPosHandler = handler;
    }
}