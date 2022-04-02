export default class InputAction {

    win: Window;

    constructor(win: Window) {
        this.win = win;
    }

    disableHandlers() {
        this.win.onkeydown = null;
        this.win.onkeyup = null;
        this.win.onclick = null;
    }

    onKeyDown(fn) {
        this.win.onkeydown = fn;
    }

    onKeyUp(fn) {
        this.win.onkeyup = fn;
    }

    onClick(fn) {
        this.win.onclick = fn;
    }
}