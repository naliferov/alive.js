import T from "../../../../T";
import NewLine from "../tab/chunks/NewLine";
import Name from "../tab/chunks/literal/Name";
import If from "../tab/chunks/conditionAndBody/if/If";
import Surround from "../tab/chunks/surround/Surround";
import Marker from "../Marker";
import IfCondition from "../tab/chunks/conditionAndBody/if/IfCondition";
import IfBody from "../tab/chunks/conditionAndBody/if/IfBody";
import For from "../tab/chunks/conditionAndBody/loop/For";
import Main from "../tab/chunks/Main";
import ForCondition from "../tab/chunks/conditionAndBody/loop/ForCondition";
import Pubsub from "../../../../io/pubsub/Pubsub";
import {MINDFIELDS_INSERTING_CHUNK} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPart from "../tab/chunks/conditionAndBody/loop/ForConditionPart";
import ForConditionPartInternal from "../tab/chunks/conditionAndBody/loop/ForConditionPartInternal";
import Nodes from "../../graph/Nodes";
import FxSerializer from "../FxSerializer";
import Callable from "../tab/chunks/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "../tab/chunks/conditionAndBody/call/callable/ConditionPart";
import BaseChunk from "../tab/chunks/BaseChunk";
import SurroundInternal from "../tab/chunks/surround/SurroundInternal";
import ConditionAndBodyChunk from "../tab/chunks/conditionAndBody/ConditionAndBodyChunk";
import ConditionChunk from "../tab/chunks/conditionAndBody/ConditionChunk";
import BodyChunk from "../tab/chunks/conditionAndBody/BodyChunk";
import FxMutatorFactory from "./FxMutatorFactory";
import ArrayChunk from "../tab/chunks/literal/array/ArrayChunk";
import ArrayItem from "../tab/chunks/literal/array/ArrayItem";
import ArrayItemParts from "../tab/chunks/literal/array/ArrayItemParts";
import ArrayBody from "../tab/chunks/literal/array/ArrayBody";
import ObjectChunk from "../tab/chunks/literal/object/ObjectChunk";
import ObjectItem from "../tab/chunks/literal/object/ObjectItem";
import ObjectItemParts from "../tab/chunks/literal/object/ObjectItemParts";
import ObjectKey from "../tab/chunks/literal/object/ObjectKey";
import ObjectValue from "../tab/chunks/literal/object/ObjectValue";
import ObjectBody from "../tab/chunks/literal/object/ObjectBody";

export type fxSerialized = {
    chunks: any[]
    markedChunksIds: string[]
};

export default class FxController {

    unit: T;
    pubsub: Pubsub;

    contextUnit;
    mindFields: Nodes;
    linesNumbers: T;

    mainChunk: Main;
    marker: Marker;
    fxSerializer: FxSerializer;
    fxMutatorFactory: FxMutatorFactory;

    constructor(
        context: T,
        pubsub: Pubsub,
        fxSerializer: FxSerializer,
        fxMutatorFactory: FxMutatorFactory,
        mindFields: Nodes
    ) {
        this.pubsub = pubsub;

        this.unit = new T({class: ['fxRuntimeController']});

        const markerMonitor = new T({class: ['markerMonitor'], txt: 'markerMonitor'});
        this.unit.in(markerMonitor);

        const chunkContainer = new T({class: ['chunksContainer']});
        this.unit.in(chunkContainer);

        this.mainChunk = new Main();
        chunkContainer.in(this.mainChunk.getUnit());
        this.fxSerializer = fxSerializer;
        this.fxMutatorFactory = fxMutatorFactory;

        this.mindFields = mindFields;

        this.contextUnit = context;
        this.marker = new Marker(markerMonitor);

        const fxSerialized: fxSerialized = this.contextUnit.getDataField('fx');
        if (!fxSerialized) console.log(`fxSerialized not found in unit ${this.contextUnit.getId()}`);

        this.fxSerializer.deserialize(this.mainChunk, fxSerialized.chunks);
    }

    show() { this.unit.show(); }
    hide() { this.unit.hide(); }
    getContextUnitId(): string { return this.contextUnit.getId(); }
    getUnit() { return this.unit; }

    async save() {
        console.log({
            chunks: this.fxSerializer.serialize(this.mainChunk),
            markedChunksIds: this.marker.getMarkedChunksIds(),
        });

        this.contextUnit.setDataField('fx', {
            chunks: this.fxSerializer.serialize(this.mainChunk),
            markedChunksIds: this.marker.getMarkedChunksIds(),
        });
        await this.mindFields.save();
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
            if (this.marker.getLength() > 1) return;

            const mutator = this.fxMutatorFactory.createMutator(this, this.marker.getFirst());
            this.addChunkAfterMarked(mutator);
            this.marker.unmarkAll().mark(mutator);

            //todo string below don't make sense because method mark in inserter starts listen for events. need to fix this
            this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);

            //implement method marked.enableInputProcessing and marked.onStopEditing to clarify
            /*marked.onControlBack(() => {
                setTimeout(() => this.pubsub.pub(FX_RUNTIME_GET_FOCUS), 300);
                marked.toggleEditTxt();
                this.save();
            });*/
            return;
        }
        if (ctrl && code === 'KeyL') {
            e.preventDefault(); if (this.marker.isEmpty()) return;

            const marked = this.marker.getFirst();
            if (marked instanceof Name) marked.switchKeyword();
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
                        this.removeChunk(surroundChunk);
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

    addChunkAfterMarked(chunk) {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() !== 1) return;

        const marked = this.marker.getFirst();
        if (marked.getNextChunk()) {
            marked.getParentChunk().insertBefore(chunk, marked.getNextChunk());
        } else {
            marked.getParentChunk().insert(chunk);
        }
        return true;
    }

    removeChunk(chunk: BaseChunk) {
        chunk.remove();
        if (chunk.getId()) {
            // @ts-ignore
            window.chunkPool.delete(chunk.getId());
        }
    }

    unmarkAll() { return this.marker.unmarkAll(); }
    mark(chunk: BaseChunk) { this.marker.mark(chunk); }

    //setCodeLinesMinHeight() { this.unit.getDOM().style.minHeight = '15em' }
    /*buildLinesNumbers(js: string[], linesNumbers: V) {
        linesNumbers.clear();
        for (let i = 0; i < js.length; i++) {
            linesNumbers.insert(new V({class: ['lineNumber'], txt: String(i + 1)}));
        }
    }*/

    syncLinesNumbers(count) {
        this.linesNumbers.clear();
        for (let i = 0; i < count; i++) {
            this.linesNumbers.insert(new T({class: ['lineNumber'], txt: String(i + 1)}));
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
            const parent = marked ? marked.getParentChunk() : null;
            const chunkForMarking = marked.getNextChunk() || marked.getPrevChunk();

            if (parent instanceof ArrayItemParts) {

                this.removeChunk(marked);
                const arrayItem = parent.getParentChunk();

                if (parent.isEmpty()) {
                    const chunkForMarking = arrayItem.getNextChunk() || arrayItem.getPrevChunk();
                    this.removeChunk(arrayItem);
                    if (chunkForMarking) this.marker.unmarkAll().mark(chunkForMarking);
                }

                return;
            }


            if (chunkForMarking) {
                this.marker.unmarkAll().mark(chunkForMarking);
            }
            if (! (marked instanceof Main)) {
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
                this.removeChunk(prevChunk);
                this.save();
            }
        }
    }

    switchToInsertingMode(chunk: BaseChunk) {
        const inserter = this.fxMutatorFactory.createMutator(this);
        chunk.insert(inserter);
        this.marker.mark(inserter);
        this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
    }

    enterBtn(shift = false, ctrl = false) {

        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            //INSERT NEW LINE
            if (ctrl && shift && marked) {
                marked.getParentChunk().insertBefore(new NewLine(), marked);
                this.save();
                return;
            }

            const inserter = this.fxMutatorFactory.createMutator(this);

            if (
                marked instanceof ObjectKey ||
                marked instanceof ObjectValue
            ) {
                return;
            }

            /*if (parent instanceof ArrayItemParts) {

                const arrayItem = parent.getParentChunk();
                const arrayBody = arrayItem.getParentChunk();

                const newArrayItem = new ArrayItem();
                newArrayItem.insert(inserter);

                if (arrayItem.getNextChunk()) {
                    arrayBody.insertBefore(newArrayItem, arrayItem.getNextChunk())
                } else {
                    arrayBody.insert(newArrayItem);
                }
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                return;
            }*/

            if (marked instanceof ObjectItem) {
                const objectItem = new ObjectItem();
                objectItem.getKey().insert(inserter);

                if (marked.getNextChunk()) {

                } else {
                    marked.getParentChunk().insert(objectItem);

                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                }
                return;
            }

            if (parent instanceof ArrayBody) {

                const newArrayItem = new ArrayItem();
                newArrayItem.insert(inserter);

                if (marked.getNextChunk()) {
                    parent.insertBefore(newArrayItem, marked.getNextChunk())
                } else {
                    parent.insert(newArrayItem);
                }
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
            if (marked instanceof ObjectValue) {
                this.marker.unmarkAll().mark(marked.getPrevChunk().getPrevChunk());
                return;
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

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectValue) {

                const objectKey = objectKeyOrValue.getPrevChunk().getPrevChunk();
                if (objectKey.isEmpty()) {
                    const inserter = this.fxMutatorFactory.createMutator(this);
                    objectKey.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll().mark(objectKey.getLastChunk());
                }
            }
        } else if (parent instanceof IfBody) {

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
                        const inserter = this.fxMutatorFactory.createMutator(this);
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
                        const inserter = this.fxMutatorFactory.createMutator(this);
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
                        const inserter = this.fxMutatorFactory.createMutator(this);
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

                    const inserter = this.fxMutatorFactory.createMutator(this);
                    newForConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);

                    return;
                }
            }
            if (marked instanceof ObjectKey) {
                this.marker.unmarkAll().mark(marked.getNextChunk().getNextChunk());
                return;
            }
            if (marked instanceof ObjectValue) return;

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

    moveRightButNoNextChunk(marked: BaseChunk, parent: BaseChunk) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectKey) {

                const objectValue = objectKeyOrValue.getNextChunk().getNextChunk();
                if (objectValue.isEmpty()) {
                    const inserter = this.fxMutatorFactory.createMutator(this);
                    objectValue.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll().mark(objectValue.getFirstChunk());
                }
            }
        } else if (parent instanceof IfCondition) {

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

            const marked = this.marker.getFirst();
            let parentChunk = marked.getParentChunk();
            if (!parentChunk || parentChunk instanceof Main) {
                return;
            }

            if (
                parentChunk instanceof ForConditionPartInternal ||
                parentChunk instanceof SurroundInternal ||
                parentChunk instanceof ArrayItemParts ||
                parentChunk instanceof ObjectItemParts ||
                parentChunk instanceof ObjectBody
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
        const inserter = this.fxMutatorFactory.createMutator(this);

        if (isCtrl && !isShift) {

            if (marked instanceof Name) return;
            else if (marked instanceof Surround) {

                this.marker.unmarkAll().mark(marked.getFirstChunk());
            } else if (marked instanceof BodyChunk) {

                if (marked.isEmpty()) {
                    this.switchToInsertingMode(marked);
                } else {
                    this.marker.unmarkAll().mark(marked.getFirstChunk());
                }

            } else if (marked instanceof ConditionAndBodyChunk) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    marked.insertInCondition(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof For) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {

                    const forConditionPart = new ForConditionPart();
                    marked.insertInCondition(forConditionPart);

                    forConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    this.marker.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof Callable) {

                if (marked.isConditionEmpty()) {
                    const callableConditionPart = new CallableConditionPart();
                    marked.insertInCondition(callableConditionPart);

                    callableConditionPart.insert(inserter);
                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                }

            }  else if (marked instanceof ForConditionPart) {

                const internal = marked.getInternal();
                if (internal.getFirstChunk()) this.marker.unmarkAll().mark(internal.getFirstChunk());

            } else if (marked instanceof ArrayChunk) {

                if (marked.isEmpty()) {
                    const arrayItem = new ArrayItem();

                    arrayItem.insert(inserter);
                    marked.insert(arrayItem);

                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    const body = marked.getBody();
                    this.marker.unmarkAll().mark(body.getFirstChunk());
                }

            } else if (marked instanceof ArrayItem) {
                this.marker.unmarkAll().mark(marked.getItemParts().getFirstChunk());

            } else if (marked instanceof ObjectChunk) {

                if (marked.isEmpty()) {
                    const objectItem = new ObjectItem();

                    objectItem.getKey().insert(inserter);
                    marked.insert(objectItem);

                    this.marker.unmarkAll().mark(inserter);
                    this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
                } else {
                    const body = marked.getBody();
                    this.marker.unmarkAll().mark(body.getFirstChunk());
                }

            } else if (marked instanceof ObjectKey) {

                //if empty insert inserter
                //else
                this.marker.unmarkAll().mark(marked.getFirstChunk().getFirstChunk());

            } else if (marked instanceof ObjectValue) {
                marked.insert(inserter);
                this.marker.unmarkAll().mark(inserter);
                this.pubsub.pub(MINDFIELDS_INSERTING_CHUNK);
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