import U from "../../../../core/U";
import Cursor from "../../txt/txtEditor/tabs/tab/editor/Cursor";
import {DELETE_KEY, TAB_KEY, TAB_REVERSE_KEY} from "../../txt/txtEditor/tabs/tab/editor/Controls/Keyboard";
import Inserter from "./chunks/Inserter";
import NewLine from "./chunks/NewLine";
import Call from "./chunks/conditionAndBody/call/call/Call";
import Name from "./chunks/literal/Name";
import If from "./chunks/conditionAndBody/if/If";
import Surround from "./chunks/Surround";
import Marker from "./Marker";
import IfCondition from "./chunks/conditionAndBody/if/IfCondition";
import IfBody from "./chunks/conditionAndBody/if/IfBody";
import For from "./chunks/conditionAndBody/loop/For";
import MainChunk from "./chunks/MainChunk";
import ForCondition from "./chunks/conditionAndBody/loop/ForCondition";
import Pubsub from "../../../../../io/pubsub/Pubsub";
import {FX_RUNTIME_GET_FOCUS, MINDFIELDS_INSERTING_CHUNK} from "../../../../../io/pubsub/PubsubConstants";
import ForBody from "./chunks/conditionAndBody/loop/ForBody";
import ForConditionPart from "./chunks/conditionAndBody/loop/ForConditionPart";
import ForConditionPartInternal from "./chunks/conditionAndBody/loop/ForConditionPartInternal";
import MindFields from "../../../mindfields/MindFields";
import FxSerializer from "./FxSerializer";
import Callable from "./chunks/conditionAndBody/call/callable/Callable";
import CallableConditionPartInternal from "./chunks/conditionAndBody/call/callable/ConditionPartInternal";
import CallableConditionPart from "./chunks/conditionAndBody/call/callable/ConditionPart";
import BaseChunk from "./chunks/BaseChunk";

export type fxSerialized = {
    chunks: any[]
    markedChunksIds: string[]
};

export default class FxController {

    unit: U;
    pubsub: Pubsub;

    cursor: Cursor;

    contextUnit;
    mindFields: MindFields;
    linesNumbers: U;

    mainChunk: MainChunk;
    marker: Marker;
    fxSerializer: FxSerializer;

    constructor(context: U, pubsub: Pubsub,  fxSerializer: FxSerializer, mindFields: MindFields) {

        this.pubsub = pubsub;

        this.unit = new U({class: ['fxRuntimeController']});
        this.unit.inBr();

        const markerMonitor = new U({class: ['markerMonitor'], txt: 'markerMonitor'});
        this.unit.in(markerMonitor);
        this.unit.inBr();

        const chunkContainer = new U({class: ['chunksContainer']});
        this.unit.in(chunkContainer);

        this.mainChunk = new MainChunk();
        chunkContainer.in(this.mainChunk.getUnit());
        this.fxSerializer = fxSerializer;

        this.mindFields = mindFields;

        this.contextUnit = context;
        this.cursor = new Cursor();
        this.marker = new Marker(markerMonitor);

        const fxSerialized: fxSerialized = this.contextUnit.getDataField('fx');
        if (!fxSerialized) console.log(`fxSerialized not found in unit ${this.contextUnit.getId()}`);

        this.fxSerializer.deserialize(this.mainChunk, fxSerialized.chunks);
    }

    show() {
        this.unit.show();
    }

    hide() {
        this.unit.hide();
    }

    getContextUnitId(): string {
        return this.contextUnit.getId();
    }

    async save() {
        this.contextUnit.setDataField('fx', {
            chunks: this.fxSerializer.serialize(this.mainChunk),
            markedChunksIds: this.marker.getMarkedChunksIds(),
        });
        await this.mindFields.save();
    }

    addChunk(chunk) {
        this.mainChunk.insert(chunk);

        const prevChunk = chunk.getPrevChunk();
        if (prevChunk && chunk instanceof Call) {
            prevChunk.displayAsFunction();
        }
    }

    addChunkBeforeMarked(chunk) {
        if (this.marker.isEmpty()) return;
        //this.chunk.insertBefore(chunk, this.markedChunk);
    }

    addChunkAfterMarked(chunk) {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            if (markedChunk.getNextChunk()) {
                markedChunk.getParentChunk().insertBefore(chunk, markedChunk.getNextChunk());
            } else {
                markedChunk.getParentChunk().insert(chunk);
            }
            return true;
        }

        return;
    }

    getUnit() { return this.unit; }

    removeChunk(chunk) {
        //todo remove from window.chunkPool.set(this.id, this);
        chunk.remove();
    }

    //setCodeLinesMinHeight() { this.unit.getDOM().style.minHeight = '15em' }
    /*buildLinesNumbers(js: string[], linesNumbers: V) {
        linesNumbers.clear();
        for (let i = 0; i < js.length; i++) {
            linesNumbers.insert(new V({class: ['lineNumber'], txt: String(i + 1)}));
        }
    }*/

    triggerKeyPress(key: string) {
        const map = {
            //'space': () => this.insertNewCharInLine(' '),
            [DELETE_KEY]: () => this.deleteBtn(),
            'enter': () => this.enterBtn(false),
            '←': () => this.moveLeft(false, false),
            '→': () => this.moveRight(false, false),
            '↓': () => this.moveDown(false, false),
            '↑': () => this.moveUp(false, false),
            [TAB_KEY]: () => this.tabBtn(false),
            [TAB_REVERSE_KEY]: () => this.tabBtn(true),
            '!': () => {},
        }

        if (map[key]) {
            map[key]();
            return;
        }

        //this.insertNewCharInLine(key);
    }

    onKeyDown(e) {

        const cursor = this.cursor;

        const k = e.key;
        const code = e.code;
        const ctrl = e.ctrlKey || e.metaKey;

        const map = {
            'ArrowLeft': (e) => this.moveLeft(e.shiftKey, ctrl),
            'ArrowRight': (e) => this.moveRight(e.shiftKey, ctrl),
            'ArrowUp': (e) => { e.preventDefault(); this.moveUp(e.shiftKey, ctrl); },
            'ArrowDown': (e) => { e.preventDefault(); this.moveDown(e.shiftKey, ctrl); },
            'Backspace': (e) => this.backspaceBtn(),
            'Delete': (e) => this.deleteBtn(),
            'Tab': (e) => { e.preventDefault(); this.tabBtn(e.shiftKey); },
            'Enter': (e) => { this.enterBtn(e.shiftKey, ctrl) }
        }
        if (map[k]) {
            e.preventDefault();
            map[k](e);
            return;
        }
        if (ctrl && code === 'KeyE') {
            e.preventDefault();
            if (this.marker.isEmpty()) return;

            const markedChunk = this.marker.getFirst();

            markedChunk.toggleEditTxt();
            this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK); //todo rename to EDITING_CHUNK and it will be more universal
            markedChunk.onControlBack(() => {
                setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
                markedChunk.toggleEditTxt();
                this.save();
            });
            return;
        }
        if (ctrl && code === 'KeyL') {
            e.preventDefault(); if (this.marker.isEmpty()) return;

            const markedChunk = this.marker.getFirst();
            if (markedChunk instanceof Name) markedChunk.toggleLetDisplay();
            return;
        }
        if (ctrl && code === 'KeyC') {
            e.preventDefault();

            /*const {y} = cursor.getPos();
            const line = this.marker.get(y);
            if (line.getText()) navigator.clipboard.writeText(line.getText());*/
            return;
        }
        if (ctrl && code === 'KeyC') {
            e.preventDefault();
            const {y} = cursor.getPos();

            if (y < 1) {
                //очистить дорожку и скопировать в буфер
                return;
            }

            /*const lastLine = (this.linesList.getLength() - 1) === y;

            const line = this.linesList.get(y);
            line.removeFromDom();
            this.linesList.del(y);

            if (lastLine) this.cursor.up();

            this.syncLinesNumbers(this.linesList.getLength());

            this.save();*/
        }
        if (ctrl && code === 'KeyB') {

            const nextUnmarkedChunk = this.marker.getLast().getNextChunk();
            if (!nextUnmarkedChunk) return;

            //todo убрать возможность перемещения на элементы surround

            const surround = new Surround();
            this.marker.iterate((chunk) => surround.insert(chunk));

            //todo отменить surround если блок внутри него и нажали ещё ctrl+b

            //вставить сураунд после последнего элемента
            //или просто в поделя
            nextUnmarkedChunk.getParentChunk().insertBefore(surround, nextUnmarkedChunk);

            e.preventDefault();
        }
        if (ctrl && code === 'KeyV') {
            navigator.clipboard.readText().then(clipText => {

                if (!clipText) {
                    return;
                }

                //processList case if clipText have more than 1 line

                /*const {x, y} = cursor.getPos();
                const line = this.linesList.get(y);
                let startTxt = line.getText().substring(0, x);
                let endTxt = line.getText().substring(x);

                line.setText(startTxt + clipText + endTxt)

                this.syncLinesNumbers(this.linesList.getLength());
                this.save();*/
            });
            return;
        }
        if (ctrl && k.toLowerCase() === 'd') {
            e.preventDefault();

            const {y} = cursor.getPos();

            /*const oldLine = this.linesList.get(y);
            const newLine = new V({tagName: 'pre', class: ['line'], txt: oldLine.getText()});

            //this.linesView.insert(newLine, y);
            this.linesList.add(newLine, y);

            cursor.down();
            this.syncLinesNumbers(this.linesList.getLength());*/
        }
    }

    syncLinesNumbers(count) {
        this.linesNumbers.clear();
        for (let i = 0; i < count; i++) {
            this.linesNumbers.insert(new U({class: ['lineNumber'], txt: String(i + 1)}));
        }
    }

    tabBtn(isShift: boolean = false) {

        /*const {x, y} = this.cursor.getPos();
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

        line.setText(lineTxt);*/

        //this.save();
    }

    deleteBtn() {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            const chunkForMarking = markedChunk.getNextChunk() || markedChunk.getPrevChunk();

            if (chunkForMarking) {
                this.marker.unmarkAll();
                this.marker.mark(chunkForMarking);
            }

            if (! (markedChunk instanceof MainChunk)) {
                this.removeChunk(markedChunk);
            }
        }

        this.save();
    }

    backspaceBtn() {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            const prevChunk = markedChunk.getPrevChunk();
            if (prevChunk) {
                prevChunk.remove();
                this.save();
            }
        }
    }

    createInserter() {
        const inserter = new Inserter();
        inserter.setInsertHandler(async (chunk) => {
            inserter.getParentChunk().insertBefore(chunk, inserter);
            this.removeChunk(inserter);
            this.marker.unmarkAll().mark(chunk);
            setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);

            await this.save();
        });
        inserter.setExitHandler(() => {
            const prevChunk = inserter.getPrevChunk();
            const parentChunk = inserter.getParentChunk();

            let chunk = prevChunk ? prevChunk : parentChunk;
            this.removeChunk(inserter);

            if (parentChunk instanceof ForConditionPartInternal) {

                const forConditionPart = parentChunk.getParentChunk();
                const prevForConditionPart = forConditionPart.getPrevChunk();
                const nextForConditionPart = forConditionPart.getNextChunk();

                if (parentChunk.isEmpty()) { //убираем conditionPart если в нём пусто

                    const forChunk = forConditionPart.getParentChunk().getParentChunk();
                    forConditionPart.remove();

                    //проверяем есть ли другие кондишен парты в forCondition
                    if (forChunk.getCondition().isEmpty()) {
                        chunk = forChunk;
                    } else {
                        chunk = prevForConditionPart ? prevForConditionPart.getLastChunk() : nextForConditionPart.getLastChunk();
                    }

                } else if (prevChunk) {
                    chunk = prevChunk;
                } else {
                    chunk = forConditionPart;
                }
            }

            this.marker.unmarkAll().mark(chunk);
            setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
        });
        //insert new chunk if it was detected and create new inserter right next after new chunk
        inserter.setNewChunkHandler(async (newChunk) => {

            inserter.getParentChunk().insertBefore(newChunk, inserter);
            this.removeChunk(inserter);

            const newInserter = this.createInserter();

            const nextChunk = newChunk.getNextChunk();
            if (nextChunk) {
                newChunk.getParentChunk().insertBefore(newInserter, nextChunk);
            } else {
                newChunk.getParentChunk().insert(newInserter);
            }

            this.marker.unmarkAll().mark(newInserter);
            await this.save();
        });

        return inserter;
    }

    enterBtn(shift = false, ctrl = false) {

        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();

            //INSERT NEW LINE
            if (ctrl && shift && marked) {
                marked.getParentChunk().insertBefore(new NewLine(), marked);
                this.save();
                return;
            }

            const inserter = this.createInserter();

            if (marked instanceof ForCondition) {

                const forConditionPart = new ForConditionPart();
                marked.insert(forConditionPart);

                //дублирование кода ещё в 4х местах ниже
                forConditionPart.insert(inserter);
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }
            if (marked instanceof ForConditionPart) {

                const forConditionPart = new ForConditionPart();
                marked.getParentChunk().insert(forConditionPart);

                forConditionPart.insert(inserter);

                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }
            if (marked instanceof IfCondition || marked instanceof IfBody) {

                marked.insert(inserter);
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }

            //INSERT INTO MARKED CHUNK
            if (ctrl && marked) {

                if (marked instanceof If) {
                    marked.insertInCondition(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                    return;
                } else {
                    marked.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                    return;
                }

            }

            if (this.addChunkAfterMarked(inserter)) {
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
            }
        }
    }

    moveLeft(isShift: boolean, isCtrl: boolean) {

        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            if (marked instanceof IfCondition) {
                const prevChunk = marked.getParentChunk().getPrevChunk(); //parent
                if (!prevChunk) return;
                this.marker.unmarkAll().mark(prevChunk);
                return;
            }
            if (marked instanceof IfBody) {
                const ifCondition = marked.getParentChunk().getCondition(); //parent
                this.marker.unmarkAll().mark(ifCondition);
                return;
            }
            if (marked instanceof ForCondition) {
                const prevChunk = marked.getParentChunk().getPrevChunk();
                if (!prevChunk) return;
                this.marker.unmarkAll().mark(prevChunk);
                return;
            }
            if (marked instanceof ForBody) {
                const forCondition = marked.getParentChunk().getCondition();
                this.marker.unmarkAll().mark(forCondition);
                return;
            }

            if (parent instanceof ForConditionPartInternal) {

                const forConditionPart = parent.getParentChunk();
                const prevForConditionPart = forConditionPart.getPrevChunk();

                if (!marked.getPrevChunk() && prevForConditionPart && prevForConditionPart.getLastChunk()) {
                    this.marker.unmarkAll().mark(prevForConditionPart.getLastChunk());
                    return;
                }
            }

            let prevChunk = marked.getPrevChunk(); if (!prevChunk) return;
            //if (prevChunk instanceof NewLine) prevChunk = prevChunk.getPrevChunk();
            if (!prevChunk) return;

            if (isShift) {
                this.marker.setDirection('left');
                this.marker.mark(prevChunk)
                return;
            }

            this.marker.unmarkAll().mark(prevChunk)
            return;
        }

        if (this.marker.getLength() > 1) {

            let markedChunk = this.marker.getLast();
            let chunk = markedChunk.getPrevChunk();
            if (!chunk) return;

            const isLeftDirection = this.marker.getDirection() === 'left';

            if (isShift) {
                if (isLeftDirection) this.marker.mark(chunk);
                else this.marker.unmark(markedChunk);
            } else {
                if (chunk instanceof NewLine) chunk = markedChunk.getPrevChunk();
                this.marker.unmarkAll().mark(chunk);
            }
        }
    }

    moveRight(isShift: boolean, isCtrl: boolean) {

        if (this.marker.isEmpty()) {
            const chunk = this.mainChunk.getFirstChunk();
            this.marker.mark(chunk);
            return;
        }

        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            const parent = markedChunk.getParentChunk();

            //CTRL
            if (isCtrl && !isShift) {

                if (!markedChunk) return;

                if (parent instanceof IfCondition) {

                    const ifChunk = parent.getParentChunk();

                    if (ifChunk.isBodyEmpty()) {
                        this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                        const inserter = this.createInserter();
                        ifChunk.getBody().insert(inserter);
                        this.marker.mark(inserter);
                    } else {
                        const first = ifChunk.getBody().getFirstChunk();
                        if (!first) return;
                        this.marker.mark(first);
                    }

                    return;
                }
                if (parent instanceof ForCondition) {

                    this.marker.unmarkAll();
                    const forChunk = parent.getParentChunk();

                    if (forChunk.isBodyEmpty()) {
                        this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                        const inserter = this.createInserter();
                        forChunk.getBody().insert(inserter);
                        this.marker.mark(inserter);
                    }
                    return;
                }
                if (parent instanceof ForConditionPartInternal) {

                    this.marker.unmarkAll();
                    const forChunk = parent.getParentChunk().getParentChunk().getParentChunk();
                    if (forChunk.isBodyEmpty()) {
                        this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                        const inserter = this.createInserter();
                        forChunk.getBody().insert(inserter);
                        this.marker.mark(inserter);
                    }
                    return;
                }
            }

            if (markedChunk instanceof IfCondition) {
                const IfBody = markedChunk.getParentChunk().getBody();
                this.marker.unmarkAll().mark(IfBody);
                return;
            }
            if (markedChunk instanceof IfBody) {
                const ifChunk = markedChunk.getParentChunk();
                if (ifChunk.getNextChunk()) this.marker.unmarkAll().mark(ifChunk.getNextChunk());
                return;
            }

            if (markedChunk instanceof ForCondition) {
                const forBody = markedChunk.getParentChunk().getBody();
                this.marker.unmarkAll().mark(forBody);
                return;
            }

            if (parent instanceof ForConditionPartInternal) {

                if (!markedChunk.getNextChunk()) {

                    const forConditionPart = parent.getParentChunk();
                    const forCondition = forConditionPart.getParentChunk();

                    if (forConditionPart.getNextChunk()) {
                        this.marker.unmarkAll().mark(forConditionPart.getNextChunk().getFirstChunk().getFirstChunk());
                        return;
                    }

                    const newForConditionPart = new ForConditionPart();
                    forCondition.getParentChunk().insertInCondition(newForConditionPart);

                    const inserter = this.createInserter();
                    newForConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);

                    return;
                }
            }

            let nextChunk = markedChunk.getNextChunk();
            if (!nextChunk) {
                this.moveRightNoNext(markedChunk, parent);
                return;
            }


            if (isShift) {
                this.marker.setDirection('right');
                this.marker.mark(nextChunk);
                return;
            }

            if (!nextChunk) return;

            this.marker.unmarkAll().mark(nextChunk);
            return;
        }

        if (this.marker.getLength() > 1) {

            let markedChunk = this.marker.getLast();
            let chunk = markedChunk.getNextChunk();
            if (chunk instanceof NewLine) chunk = markedChunk.getNextChunk();
            if (!chunk) return;

            if (isShift) {
                if (this.marker.getDirection() === 'right') this.marker.mark(chunk);
                else this.marker.unmark(markedChunk);
            } else {
                this.marker.unmarkAll().mark(chunk);
            }
        }
    }

    moveRightNoNext(markedElement: BaseChunk, parent: BaseChunk) {

        if (parent instanceof IfCondition) {

            const ifBody = parent.getParentChunk().getBody();
            if (ifBody.getFirstChunk()) {
                this.marker.unmarkAll().mark(ifBody.getFirstChunk());
            } else {
                //todo createInserter
            }
        }
    }

    moveUp(isShift: boolean, isCtrl: boolean) {
        if (this.marker.isEmpty()) return;

        if (isCtrl) {
            let parentChunk = this.marker.getFirst().getParentChunk();
            if (!parentChunk) return;

            if (parentChunk instanceof ForConditionPartInternal) {
                parentChunk = parentChunk.getParentChunk();
            }

            this.marker.unmarkAll().mark(parentChunk);
            return;
        }

        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            let prev = markedChunk.getPrevChunk();
            if (!prev) return;

            while (prev) {
                if (prev instanceof NewLine && !(prev.getPrevChunk() instanceof NewLine)) {
                    break;
                }
                prev = prev.getPrevChunk();
            }
            if (!prev) return;
            const prevChunk = prev.getPrevChunk();

            if (prev instanceof NewLine && prevChunk) {
                this.marker.unmarkAll().reset();
                this.marker.mark(prevChunk);
            }

            return;
        }
    }

    moveDown(isShift: boolean, isCtrl: boolean) {

        if (this.marker.isEmpty()) {
            const chunk = this.mainChunk.getFirstChunk();
            this.marker.mark(chunk);
            return;
        }

        const markedChunk = this.marker.getFirst();

        if (isCtrl && !isShift) {

            if (markedChunk instanceof If) {

                if (markedChunk.isConditionEmpty() && markedChunk.isBodyEmpty()) {
                    this.marker.unmarkAll();

                    const inserter = this.createInserter();
                    markedChunk.insertInCondition(inserter);
                    this.marker.mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll();
                    const condition = markedChunk.getCondition();
                    this.marker.mark(condition);
                }

            } else if (markedChunk instanceof For) {

                if (markedChunk.isConditionEmpty() && markedChunk.isBodyEmpty()) {

                    const forConditionPart = new ForConditionPart();
                    markedChunk.insertInCondition(forConditionPart);

                    const inserter = this.createInserter();
                    forConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    const condition = markedChunk.getCondition();
                    this.marker.unmarkAll().mark(condition);
                }

            } else if (markedChunk instanceof ForConditionPart) {

                const internal = markedChunk.getInternal();
                if (internal.getFirstChunk()) this.marker.unmarkAll().mark(internal.getFirstChunk());

            } else if (markedChunk instanceof ForBody) {
                const inserter = this.createInserter();
                markedChunk.insert(inserter);
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
            } else if (markedChunk instanceof Callable) {

                if (markedChunk.isConditionEmpty()) {
                    this.marker.unmarkAll();

                    const callableConditionPart = new CallableConditionPart();
                    markedChunk.insertInCondition(callableConditionPart);

                    const inserter = this.createInserter();
                    callableConditionPart.insert(inserter);
                    this.marker.mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                }

            } else if (markedChunk instanceof Name) {
                return;
            }  else {
                const firstChunk = markedChunk.getFirstChunk();
                if (firstChunk) {
                    this.marker.unmarkAll().mark(firstChunk);
                }
            }

            return;
        }

        if (this.marker.getLength() === 1) {

            const markedChunk = this.marker.getFirst();
            let next = markedChunk.getNextChunk();
            if (!next) return;

            while (next) {
                if (next instanceof NewLine && !(next.getNextChunk() instanceof NewLine)) {
                    break;
                }
                next = next.getNextChunk();
            }

            if (!next) return;
            const nextChunk = next.getNextChunk();

            if (next instanceof NewLine && nextChunk) {
                this.marker.unmarkAll().mark(nextChunk);
            }

        }
    }

    close() {
        this.unit.removeFromDom();
    }
}