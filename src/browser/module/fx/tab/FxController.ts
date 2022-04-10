import U from "../../../core/U";
import {DELETE_KEY, TAB_KEY, TAB_REVERSE_KEY} from "../../txtEdit/txt/txtEditor/tabs/tab/editor/Controls/Keyboard";
import Inserter from "./chunks/Inserter";
import NewLine from "./chunks/NewLine";
import Call from "./chunks/conditionAndBody/call/call/Call";
import Name from "./chunks/literal/Name";
import If from "./chunks/conditionAndBody/if/If";
import Surround from "./chunks/surround/Surround";
import Marker from "./Marker";
import IfCondition from "./chunks/conditionAndBody/if/IfCondition";
import IfBody from "./chunks/conditionAndBody/if/IfBody";
import For from "./chunks/conditionAndBody/loop/For";
import MainChunk from "./chunks/MainChunk";
import ForCondition from "./chunks/conditionAndBody/loop/ForCondition";
import Pubsub from "../../../../io/pubsub/Pubsub";
import {FX_RUNTIME_GET_FOCUS, MINDFIELDS_INSERTING_CHUNK} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPart from "./chunks/conditionAndBody/loop/ForConditionPart";
import ForConditionPartInternal from "./chunks/conditionAndBody/loop/ForConditionPartInternal";
import MindFields from "../../mindfields/MindFields";
import FxSerializer from "./FxSerializer";
import Callable from "./chunks/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "./chunks/conditionAndBody/call/callable/ConditionPart";
import BaseChunk from "./chunks/BaseChunk";
import SurroundInternal from "./chunks/surround/SurroundInternal";
import ConditionAndBodyChunk from "./chunks/conditionAndBody/ConditionAndBodyChunk";
import ConditionChunk from "./chunks/conditionAndBody/ConditionChunk";
import BodyChunk from "./chunks/conditionAndBody/BodyChunk";

export type fxSerialized = {
    chunks: any[]
    markedChunksIds: string[]
};

export default class FxController {

    unit: U;
    pubsub: Pubsub;

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

        const k = e.key;
        const code = e.code;
        const ctrl = e.ctrlKey || e.metaKey;

        const map = {
            'ArrowLeft': (e) => this.moveLeft(e.shiftKey, ctrl),
            'ArrowRight': (e) => this.moveRight(e.shiftKey, ctrl),
            'ArrowUp': (e) => { e.preventDefault(); this.moveUp(e.shiftKey, ctrl); },
            'ArrowDown': (e) => { e.preventDefault(); this.moveDown(e.shiftKey, ctrl); },
            'Backspace': (e) => {
                if (ctrl) { this.deleteBtn(); return; }
                this.backspaceBtn();
            },
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

            const marked = this.marker.getFirst();

            marked.toggleEditTxt();
            this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK); //todo rename to EDITING_CHUNK and it will be more universal

            //implement method marked.enableInputProcessing and marked.onStopEditing to clarify
            marked.onControlBack(() => {
                setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
                marked.toggleEditTxt();
                this.save();
            });
            return;
        }
        if (ctrl && code === 'KeyL') {
            e.preventDefault(); if (this.marker.isEmpty()) return;

            const marked = this.marker.getFirst();
            if (marked instanceof Name) marked.toggleLetDisplay();
            this.save();
            return;
        }
        if (ctrl && code === 'KeyC') {
            e.preventDefault();
            return;
        }
        if (ctrl && code === 'KeyC') {
            e.preventDefault();

            /*const lastLine = (this.linesList.getLength() - 1) === y;

            const line = this.linesList.get(y);
            line.removeFromDom();
            this.linesList.del(y);

            if (lastLine) this.cursor.up();

            this.syncLinesNumbers(this.linesList.getLength());

            this.save();*/
        }
        if (ctrl && code === 'KeyB') {

            e.preventDefault();
            const marked = this.marker.getFirst();
            if (!marked) return;

            const parent = marked.getParentChunk();

            if (this.marker.getLength() === 1) {

                if (parent instanceof SurroundInternal) {

                    const surroundChunk = parent.getParentChunk();
                    const parentAboveSurround = surroundChunk.getParentChunk().getUnit().getDOM();

                    const chunks = parent.getChildren();
                    const chunksCount = parent.getChildrenCount();

                    if (chunksCount) {
                        for (let i = 0; i < chunksCount; i++) {
                            parentAboveSurround.insertBefore(chunks[0], surroundChunk.getUnit().getDOM());
                        }
                        surroundChunk.remove();
                        return;
                    }
                }
            }

            const nextChunk = marked.getNextChunk();

            const surround = new Surround();
            this.marker.iterate((chunk) => surround.insert(chunk));

            if (nextChunk) nextChunk.getParentChunk().insertBefore(surround, nextChunk)
            else parent.insert(surround);
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

            const marked = this.marker.getFirst();
            const chunkForMarking = marked.getNextChunk() || marked.getPrevChunk();

            if (chunkForMarking) {
                this.marker.unmarkAll();
                this.marker.mark(chunkForMarking);
            }

            if (! (marked instanceof MainChunk)) {
                this.removeChunk(marked);
            }
        }

        this.save();
    }

    backspaceBtn() {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const prevChunk = marked.getPrevChunk();
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

                    const For = forConditionPart.getParentChunk().getParentChunk();
                    forConditionPart.remove();

                    if (For.getCondition().isEmpty()) {
                        chunk = For;
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

    switchToInsertingMode(chunk: BaseChunk) {
        const inserter = this.createInserter();
        chunk.insert(inserter);
        this.marker.mark(inserter);
        this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
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

            if (marked instanceof ForConditionPart) {

                const forConditionPart = new ForConditionPart();
                marked.getParentChunk().insert(forConditionPart);

                forConditionPart.insert(inserter);

                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }
            if (marked instanceof ForCondition) {

                const forConditionPart = new ForConditionPart();
                marked.insert(forConditionPart);

                //дублирование кода ещё в 4х местах ниже
                forConditionPart.insert(inserter);
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }
            if (marked instanceof ConditionChunk || marked instanceof BodyChunk) {
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

            if (marked instanceof ConditionChunk) {
                const prevChunk = marked.getParentChunk().getPrevChunk();
                if (!prevChunk) return;
                this.marker.unmarkAll().mark(prevChunk);
                return;
            }
            if (marked instanceof BodyChunk) {
                this.marker.unmarkAll().mark(marked.getParentChunk().getCondition());
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

            let prevChunk = marked.getPrevChunk();
            if (!prevChunk) {
                this.moveLeftButNoNextChunk(marked, parent);
                return;
            }

            if (isShift) {
                this.marker.setDirection('left');
                this.marker.mark(prevChunk)
                return;
            }

            this.marker.unmarkAll().mark(prevChunk)
            return;
        }

        if (this.marker.getLength() > 1) {

            let marked = this.marker.getLast();
            let chunk = marked.getPrevChunk();
            if (!chunk) return;

            const isLeftDirection = this.marker.getDirection() === 'left';

            if (isShift) {
                if (isLeftDirection) this.marker.mark(chunk);
                else this.marker.unmark(marked);
            } else {
                if (chunk instanceof NewLine) chunk = marked.getPrevChunk();
                this.marker.unmarkAll().mark(chunk);
            }
        }
    }

    moveLeftButNoNextChunk(marked: BaseChunk, parent: BaseChunk) {

        if (parent instanceof IfBody) {

            const ifCondition = parent.getParentChunk().getCondition();
            if (ifCondition.getLastChunk()) {
                this.marker.unmarkAll().mark(ifCondition.getLastChunk());
            } else {
                this.switchToInsertingMode(ifCondition);
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

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            //CTRL
            if (isCtrl && !isShift) {

                if (!marked) return;

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

            if (marked instanceof ConditionChunk) {
                const body = marked.getParentChunk().getBody();
                this.marker.unmarkAll().mark(body);
                return;
            }
            if (marked instanceof IfBody) {
                const conditionBodyChunk = marked.getParentChunk();
                if (conditionBodyChunk.getNextChunk()) this.marker.unmarkAll().mark(conditionBodyChunk.getNextChunk());
                return;
            }
            if (marked instanceof ForCondition) {
                const forBody = marked.getParentChunk().getBody();
                this.marker.unmarkAll().mark(forBody);
                return;
            }

            if (parent instanceof ForConditionPartInternal) {

                if (!marked.getNextChunk()) {

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

            let nextChunk = marked.getNextChunk();
            if (!nextChunk) {
                this.moveRightButNoNextChunk(marked, parent);
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

            let marked = this.marker.getLast();
            let chunk = marked.getNextChunk();
            if (chunk instanceof NewLine) chunk = marked.getNextChunk();
            if (!chunk) return;

            if (isShift) {
                if (this.marker.getDirection() === 'right') this.marker.mark(chunk);
                else this.marker.unmark(marked);
            } else {
                this.marker.unmarkAll().mark(chunk);
            }
        }
    }

    moveRightButNoNextChunk(markedElement: BaseChunk, parent: BaseChunk) {

        if (parent instanceof IfCondition) {

            const ifBody = parent.getParentChunk().getBody();
            if (ifBody.getFirstChunk()) {
                this.marker.unmarkAll().mark(ifBody.getFirstChunk());
            } else {
                this.switchToInsertingMode(ifBody);
            }
        }
    }

    moveUp(isShift: boolean, isCtrl: boolean) {
        if (this.marker.isEmpty()) return;

        if (isCtrl) {
            let parentChunk = this.marker.getFirst().getParentChunk();
            if (!parentChunk) return;
            if (
                parentChunk instanceof ForConditionPartInternal ||
                parentChunk instanceof SurroundInternal
            ) {
                parentChunk = parentChunk.getParentChunk();
            }

            this.marker.unmarkAll().mark(parentChunk);
            return;
        }

        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            let prev = marked.getPrevChunk();
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

        const marked = this.marker.getFirst();

        if (isCtrl && !isShift) {

            if (marked instanceof Name) return;
            else if (marked instanceof Surround) {

                const condition = marked.getFirstChunk();
                this.marker.unmarkAll().mark(condition);
            }
            else if (marked instanceof BodyChunk) {

                if (marked.isEmpty()) {
                    this.switchToInsertingMode(marked);
                } else {
                    this.marker.unmarkAll().mark(marked.getFirstChunk());
                }
            }
            else if (marked instanceof ConditionAndBodyChunk) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    this.marker.unmarkAll();

                    const inserter = this.createInserter();
                    marked.insertInCondition(inserter);
                    this.marker.mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll();
                    const condition = marked.getCondition();
                    this.marker.mark(condition);
                }

            }
            else if (marked instanceof For) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {

                    const forConditionPart = new ForConditionPart();
                    marked.insertInCondition(forConditionPart);

                    const inserter = this.createInserter();
                    forConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    const condition = marked.getCondition();
                    this.marker.unmarkAll().mark(condition);
                }

            } else if (marked instanceof ForConditionPart) {

                const internal = marked.getInternal();
                if (internal.getFirstChunk()) this.marker.unmarkAll().mark(internal.getFirstChunk());

            } else if (marked instanceof Callable) {

                if (marked.isConditionEmpty()) {
                    this.marker.unmarkAll();

                    const callableConditionPart = new CallableConditionPart();
                    marked.insertInCondition(callableConditionPart);

                    const inserter = this.createInserter();
                    callableConditionPart.insert(inserter);
                    this.marker.mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                }

            } else {
                const firstChunk = marked.getFirstChunk();
                if (firstChunk) {
                    this.marker.unmarkAll().mark(firstChunk);
                }
            }

            return;
        }

        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            let next = marked.getNextChunk();
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