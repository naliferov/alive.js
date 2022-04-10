import U from "../../../core/U";
import Console from "../../fx/Console";

export default class CircleMover {

    unit: U;
    console: Console;
    shiftCursorHandler;
    horizontalLock: boolean = false;

    constructor(console: Console) {
        this.unit = new U({class: ['circle', 'noselect']});
        this.console = console;

        let shiftX = 0;
        let shiftY = 0;

        const thresholdX = 3;
        const thresholdY = 9;
        let lastX = 0;
        let lastY = 0;

        const moveHandler = (e) => {
            e.preventDefault();

            const touch = e.touches[0];

            if (!lastX) lastX = touch.pageX
            if (!lastY) lastY = touch.pageY

            const diffX = touch.pageX - lastX;
            const diffY = touch.pageY - lastY;
            if (Math.abs(diffX) > thresholdX) {
                if (this.shiftCursorHandler) this.shiftCursorHandler(diffX > 0 ? '→': '←');
                lastX = touch.pageX;
            }

            if (!this.horizontalLock && Math.abs(diffY) > thresholdY) {
                if (this.shiftCursorHandler) this.shiftCursorHandler(diffY > 0 ? '↓': '↑');
                lastY = touch.pageY;
            }

            const x = touch.pageX - shiftX;
            const y = touch.pageY - shiftY;

            this.unit.makeMoveble();
            this.unit.setCoords(x, y);
        };

        this.unit.on('touchstart', (e) => {

            const touch = e.touches[0];
            const sizes = this.unit.getSizes();
            shiftX = touch.pageX - sizes.left + (sizes.width / 2);
            shiftY = touch.pageY - sizes.top + (sizes.height / 2);

            this.unit.on('touchmove', moveHandler);
        });
        this.unit.on('touchend', (e) => {
            this.unit.off('touchmove', moveHandler);
        });

        const moveHandler1 = (e) => {
            e.preventDefault();

            const touch = e;

            /*const diffX = touch.pageX - lastX;
            const diffY = touch.pageY - lastY;
            if (Math.abs(diffX) > thresholdX) {
                if (this.shiftCursorHandler) this.shiftCursorHandler(diffX > 0 ? '→': '←');
                lastX = touch.pageX;
            }
            if (!this.horizontalLock && Math.abs(diffY) > thresholdY) {
                if (this.shiftCursorHandler) this.shiftCursorHandler(diffY > 0 ? '↓': '↑');
                lastY = touch.pageY;
            }*/

            const x = touch.clientX - shiftX;
            const y = touch.clientY - shiftY;
            this.unit.setCoords(x, y);
        };

        this.unit.on('mousedown', (e) => {

            //this.unit.makeMoveble();

            const touch = e
            const sizes = this.unit.getSizes();
            shiftX = touch.clientX - sizes.left;
            shiftY = touch.clientY - sizes.top;

            this.unit.on('mousemove', moveHandler1);
        });
        this.unit.on('mouseup', (e) => {
            this.unit.off('mousemove', moveHandler1);
        });
    }

    enableHorizontalLock() { this.horizontalLock = true; }
    disableHorizontalLock() { this.horizontalLock = false; }

    setShiftCursorHandler(shiftCursorHandler) {
        this.shiftCursorHandler = shiftCursorHandler;
    }

    getUnit() { return this.unit; }
}