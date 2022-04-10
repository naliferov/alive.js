import U from "../../../../../../../core/U";
import Cursor from "./Cursor";
import List from "../../../../../../../core/List";
import State from "../../../../../../mindfields/state/State";
import Selector from "./Selector";
import {DELETE_KEY, TAB_KEY, TAB_REVERSE_KEY} from "./Controls/Keyboard";

export default class Lines {

    unit: U;

    cursor: Cursor;
    selector: Selector;

    linesList: List;

    linesNumbers: U;
    linesView: U;

    contextUnit;
    state: State;

    constructor(contextUnit: U) {

        this.unit = new U({class: ['lines']});
        this.linesList = new List();

        this.linesNumbers = new U({class: ['lineNumbers']});
        //this.unit.insert(this.linesNumbers);

        this.linesView = new U({class: ['lines']});
        this.unit.insert(this.linesView);

        const jsArray = contextUnit.getJs().split('\n');
        this.buildLinesNumbers(jsArray, this.linesNumbers);

        for (let i = 0; i < jsArray.length; i++) {
            const codeLine = new U({tagName: 'pre', class: ['line', 'noselect'], txt: jsArray[i]});
            this.linesView.insert(codeLine);
            this.linesList.add(codeLine);
        }

        this.contextUnit = contextUnit;

        this.cursor = new Cursor();
        this.selector = new Selector(this.linesView, this.cursor);
    }

    afterRender() {
        this.unit.insert(this.cursor.getUnit());
        this.unit.insert(this.selector.getUnit());
        this.setCodeLinesMinHeight();

        //const shiftX = this.linesView.getSizes().left;
        //this.cursor.setShift(shiftX, 0);
        //this.selector.setShift(shiftX, 0);
        /*setTimeout(() => {}, 200);*/
    }

    setCodeLinesMinHeight() {
        this.unit.getDOM().style.minHeight = '15em';
    }

    setCodeLinesHeight() {
        const windowHeight = window.innerHeight;
        const navHeight = document.getElementById('nav') ? document.getElementById('nav').getBoundingClientRect().height : 0;
        const tabsNamesHeight = document.getElementById('tabsNames').getBoundingClientRect().height;
        this.unit.getDOM().style.minHeight = windowHeight - (navHeight + tabsNamesHeight) + 'px';
    }

    getUnit() { return this.unit; }

    buildLinesNumbers(js: string[], linesNumbers: U) {
        linesNumbers.clear();
        for (let i = 0; i < js.length; i++) {
            linesNumbers.insert(new U({class: ['lineNumber'], txt: String(i + 1)}));
        }
    }

    triggerKeyPress(key: string) {

        const map = {
            'space': () => this.insertNewCharInLine(' '),
            [DELETE_KEY]: () => this.backspaceBtn(),
            'enter': () => this.enterBtn(),
            '←': () => this.moveLeft(false),
            '→': () => this.moveRight(false),
            '↓': () => this.moveDown(false),
            '↑': () => this.moveUp(false),
            [TAB_KEY]: () => this.tabBtn(false),
            [TAB_REVERSE_KEY]: () => this.tabBtn(true),
            '!': () => {},
        }

        if (map[key]) {
            map[key]();
            return;
        }

        this.insertNewCharInLine(key);
    }

    enableControl() {

        const cursor = this.cursor;

        cursor.startBlinking();

        window.onkeydown = (e) => {

            const k = e.key;

            const map = {
                'ArrowLeft': (e) => this.moveLeft(e.shiftKey),
                'ArrowRight': (e) => this.moveRight(e.shiftKey),
                'ArrowUp': (e) => { e.preventDefault(); this.moveUp(e.shiftKey); },
                'ArrowDown': (e) => { e.preventDefault(); this.moveDown(e.shiftKey); },
                'Backspace': (e) => this.backspaceBtn(),
                'Tab': (e) => { e.preventDefault(); this.tabBtn(e.shiftKey); },
                'Enter': (e) => { this.enterBtn() }
            }
            if (map[k]) {
                map[k](e);
                return;
            }
            if (e.ctrlKey && k.toLowerCase() === 'c') {
                e.preventDefault();

                const {y} = cursor.getPos();
                const line = this.linesList.get(y);
                if (line.getText()) navigator.clipboard.writeText(line.getText());
                return;
            }
            if (e.ctrlKey && k.toLowerCase() === 'x') {
                e.preventDefault();

                const {y} = cursor.getPos();

                if (y < 1) {
                    //очистить дорожку и скопировать в буфер
                    return;
                }

                const lastLine = (this.linesList.getLength() - 1) === y;

                const line = this.linesList.get(y);
                line.removeFromDom();
                this.linesList.del(y);

                if (lastLine) this.cursor.up();

                this.syncLinesNumbers(this.linesList.getLength());

                this.save();
            }
            if (e.ctrlKey && k.toLowerCase() === 'v') {
                navigator.clipboard.readText().then(clipText => {

                    if (!clipText) {
                        return;
                    }

                    //processList case if clipText have more than 1 line

                    const {x, y} = cursor.getPos();
                    const line = this.linesList.get(y);
                    let startTxt = line.getText().substring(0, x);
                    let endTxt = line.getText().substring(x);

                    line.setText(startTxt + clipText + endTxt)

                    this.syncLinesNumbers(this.linesList.getLength());
                    this.save();
                });
                return;
            }
            if (e.ctrlKey && k.toLowerCase() === 'd') {
                e.preventDefault();

                const {y} = cursor.getPos();

                const oldLine = this.linesList.get(y);
                const newLine = new U({tagName: 'pre', class: ['line'], txt: oldLine.getText()});

                this.linesView.insert(newLine, y);
                this.linesList.add(newLine, y);

                cursor.down();
                this.syncLinesNumbers(this.linesList.getLength());
            }
        }

        window.onkeypress = async (e) => {
            if (e.key === 'Enter') return;
            this.insertNewCharInLine(e.key);
        }
    }

    disableControl() {
        window.onkeypress = null;
        window.onkeydown = null;
        this.cursor.stopBlinking();
    }

    syncLinesNumbers(count) {
        this.linesNumbers.clear();
        for (let i = 0; i < count; i++) {
            this.linesNumbers.insert(new U({class: ['lineNumber'], txt: String(i + 1)}));
        }
    }

    tabBtn(isShift: boolean = false) {

        const {x, y} = this.cursor.getPos();
        const line = this.linesList.get(y);
        let lineTxt = '';

        if (isShift) {
            if (x < 4) lineTxt = line.getText().substring(x);
            else lineTxt = line.getText().substring(0, x - 4) + line.getText().substring(x);
            for (let i = 0; i < 4; i++) this.cursor.left();
        } else {
            lineTxt = line.getText().substring(0, x) + '    ' + line.getText().substring(x);
            for (let i = 0; i < 4; i++) this.cursor.right();
        }

        line.setText(lineTxt);
        //this.save();
    }

    backspaceBtn() {
        const {x, y} = this.cursor.getPos();
        const line = this.linesList.get(y);
        const lineTxt = line.getText();
        const prevLine = this.linesList.get(y - 1);

        if (x < 1) {
            if (y < 1) return; //if this is first line

            line.removeFromDom();
            this.linesList.del(y);

            this.cursor.up();
            this.cursor.setPos(prevLine.getText().length);
            prevLine.setText(prevLine.getText() + lineTxt);

            this.syncLinesNumbers(this.linesList.getLength());
            this.save();
            return;
        }

        let lineArr = line.getText().split('');
        lineArr.splice(x - 1, 1);
        line.setText(lineArr.join(''));

        this.cursor.left();
        this.save();
    }

    enterBtn() {
        const {x, y} = this.cursor.getPos();

        let line = this.linesList.get(y);
        let lineArr = line.getText().split('');

        const leftPart = lineArr.slice(0, x);
        const rightPart = lineArr.splice(x, lineArr.length);
        line.setText(leftPart.join(''));

        const codeLine = new U({tagName: 'pre', class: ['line'], txt: rightPart.join('')});

        this.linesView.insert(codeLine, y + 1);
        this.linesList.add(codeLine, y + 1);

        this.cursor.down();
        this.cursor.setPos(0);
        this.syncLinesNumbers(this.linesList.getLength());

        this.save();
    }

    moveCursorOnExistsPosition(x) {
        const line = this.linesList.get(this.cursor.getPos().y);
        if (x > line.getText().length) this.cursor.setPos(line.getText().length);
    }

    moveLeft(isShift: boolean) {
        if ((this.cursor.x - 1) < 0) return;

        if (isShift && !this.selector.active) this.selector.activate('left');

        this.cursor.left();

        if (isShift) this.selector.renderSelection();
        else this.selector.reset();
    }

    moveRight(isShift: boolean) {
        const {x, y} = this.cursor.getPos();
        const line = this.linesList.get(y);

        if (x > line.getText().length - 1) return;

        if (isShift && !this.selector.active) this.selector.activate('right');

        this.cursor.right();

        if (isShift) this.selector.renderSelection();
        else this.selector.reset();
    }

    moveUp(isShift: boolean) {
        const {x, y} = this.cursor.getPos();

        if (isShift && !this.selector.active) this.selector.activate('left');

        this.cursor.up();
        this.moveCursorOnExistsPosition(x);

        if (isShift) this.selector.renderSelection();
        else this.selector.reset();
    }

    moveDown(isShift: boolean) {
        const {x, y} = this.cursor.getPos();
        if (y + 1 > this.linesList.getLength() - 1) return;

        if (isShift && !this.selector.active) this.selector.activate('right');

        this.cursor.down();
        this.moveCursorOnExistsPosition(x);

        if (isShift) this.selector.renderSelection();
        else this.selector.reset();
    }

    insertNewCharInLine(char: string) {
        const {x, y} = this.cursor.getPos();
        const line = this.linesList.get(y);
        const txt = line.getText();

        line.setText( txt.substring(0, x) + char + txt.substring(x) );

        this.cursor.right();
        this.save();
    }

    setCursorPos(pos) {
        //todo validate exist line and shift
        this.cursor.setPos(pos.x, pos.y);
    }

    onChangeCursorPosition(changeCursorPosHandler) { this.cursor.onChangeCursorPosition(changeCursorPosHandler); }

    async save() {
        const lines = this.linesList.getAll();
        const jsArray = [];
        for (let i = 0; i < lines.length; i++) jsArray.push(lines[i].getText());
        //this.contextUnit.setJs(jsArray.join('\n'));

        //await this.state.save();
    }
}