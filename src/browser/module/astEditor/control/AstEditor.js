import T from "../../../../type/T";
import NewLine from "../nodes/NewLine";
import Id from "../nodes/id/Id";
import SubId from "../nodes/id/SubId";
import SubIdContainer from "../nodes/id/SubIdContainer";
import If from "../nodes/conditionAndBody/if/If";
import Surround from "../nodes/surround/Surround";
import Marker from "../Marker";
import IfCondition from "../nodes/conditionAndBody/if/IfCondition";
import IfBody from "../nodes/conditionAndBody/if/IfBody";
import For from "../nodes/conditionAndBody/loop/For";
import Main from "../nodes/Main";
import ForCondition from "../nodes/conditionAndBody/loop/ForCondition";
import {AST_NODE_EDIT_MODE} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPart from "../nodes/conditionAndBody/loop/ForConditionPart";
import ForConditionPartInternal from "../nodes/conditionAndBody/loop/ForConditionPartInternal";
import Callable from "../nodes/conditionAndBody/call/callable/Callable";
import CallableModule from "../nodes/module/CallableModule";
import CallableConditionPart from "../nodes/conditionAndBody/call/callable/ConditionPart";
import SurroundInternal from "../nodes/surround/SurroundInternal";
import ConditionAndBodyNode from "../nodes/conditionAndBody/ConditionAndBodyNode";
import ConditionNode from "../nodes/conditionAndBody/ConditionNode";
import BodyNode from "../nodes/conditionAndBody/BodyNode";
import ArrayChunk from "../nodes/literal/array/ArrayChunk";
import ArrayItem from "../nodes/literal/array/ArrayItem";
import ArrayItemParts from "../nodes/literal/array/ArrayItemParts";
import ArrayBody from "../nodes/literal/array/ArrayBody";
import ObjectChunk from "../nodes/literal/object/ObjectChunk";
import ObjectItem from "../nodes/literal/object/ObjectItem";
import ObjectItemParts from "../nodes/literal/object/ObjectItemParts";
import ObjectKey from "../nodes/literal/object/ObjectKey";
import ObjectValue from "../nodes/literal/object/ObjectValue";
import ObjectBody from "../nodes/literal/object/ObjectBody";
import Call from "../nodes/conditionAndBody/call/call/Call";
import CallConditionPart from "../nodes/conditionAndBody/call/call/CallConditionPart";

export default class AstEditor {

    unit;
    pubsub;

    context;
    nodes;

    mainChunk;
    marker;
    serializer;
    astEditor;

    moduleType = 'simple';

    constructor(
        context,
        pubsub,
        serializer,
        astEditor,
        nodes
    ) {
        this.context = context;
        this.pubsub = pubsub;
        this.serializer = serializer;
        this.astEditor = astEditor;
        this.nodes = nodes;


        this.unit = new T({class: ['astEditor']});

        const markerMonitor = new T({class: ['markedNode'], name: 'markedNode: '});
        this.unit.in(markerMonitor);
        this.marker = new Marker(markerMonitor);

        this.mainChunk = new Main();
        this.unit.in(this.mainChunk.getUnit());

        let module = this.mainChunk;

        this.moduleType = this.context.getDataField('moduleType') ?? 'simple';
        if (this.moduleType === 'callableModule') {
            this.callableModule = new CallableModule;
            this.mainChunk.insert(this.callableModule);
            module = this.callableModule
        }

        const astNodes = this.context.getDataField('astNodes');
        if (!astNodes) {
            console.log(`astNodes not found in unit ${this.context.getId()}`);
            return;
        }

        this.serializer.deserialize(module, astNodes.chunks);
    }

    show() { this.unit.show(); }
    hide() { this.unit.hide(); }
    getContextUnitId() { return this.context.getId(); }
    getUnit() { return this.unit; }

    async save() {
        this.context.setDataField('astNodes', {
            chunks: this.serializer.serialize(this.mainChunk),
            markedChunksIds: this.marker.getMarkedChunksIds(),
        });
        await this.nodes.save();
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
            //'Tab': (e) => { e.preventDefault(); this.tabBtn(e.shiftKey); },
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
            this.astEditor.editNode(this.marker.getFirst(), this);
            //setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);

            return;
        }
        if (ctrl && code === 'KeyL') {
            e.preventDefault();
            if (this.marker.isEmpty()) return;

            const marked = this.marker.getFirst();
            if (marked instanceof Id) marked.switchKeyword();
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

    addChunkBeforeMarked(chunk) {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() !== 1) return;

        const marked = this.marker.getFirst();
        marked.getParentChunk().insertBefore(chunk, marked);
        return true;
    }

    removeChunk(chunk) {
        chunk.remove();
        if (chunk.getId()) window.astNodesPool.delete(chunk.getId());
    }

    unmarkAll() { return this.marker.unmarkAll(); }
    mark(chunk) { this.marker.mark(chunk); }

    deleteBtn() {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const prevChunk = marked.getPrevChunk();
            const parent = marked ? marked.getParentChunk() : null;
            const chunkForMarking = marked.getPrevChunk() || marked.getNextChunk();

            if (parent instanceof ArrayItemParts) {

                const arrayItem = parent.getParentChunk();
                const array = arrayItem.getParentChunk().getParentChunk();

                this.removeChunk(marked);

                if (parent.isEmpty()) {
                    const chunkForMarking = arrayItem.getNextChunk() || arrayItem.getPrevChunk();
                    this.removeChunk(arrayItem);
                    if (chunkForMarking) this.marker.unmarkAll().mark(chunkForMarking);
                    else this.marker.unmarkAll().mark(array);
                }

                this.save();
                return;
            }

            if (prevChunk instanceof NewLine && !prevChunk.hasVerticalShift()) {
                if (prevChunk.getPrevChunk()) {
                    this.marker.unmarkAll().mark(prevChunk.getPrevChunk());
                }
                this.removeChunk(marked);
                this.removeChunk(prevChunk);
                this.save();
                return;
            }

            if (chunkForMarking) {
                this.marker.unmarkAll().mark(chunkForMarking);
            }
            if (! (marked instanceof Main)) {
                this.removeChunk(marked);
            }
            this.save();
        }
    }

    backspaceBtn() {

        console.log('backspace');

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

    switchToInsertingMode(chunk) {
        const inserter = this.astEditor.createEditNode(this);
        chunk.insert(inserter);
        this.marker.unmarkAll().mark(inserter);
        this.pubsub.pub(AST_NODE_EDIT_MODE);
        inserter.focus();
    }

    markSendEventAndFocus(editNode) {
        this.marker.unmarkAll().mark(editNode);
        this.pubsub.pub(AST_NODE_EDIT_MODE);
        editNode.focus();
    }

    enterBtn(shift = false, ctrl = false) {

        if (this.marker.isEmpty()) {
            this.switchToInsertingMode(this.mainChunk);
            return;
        }
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            //INSERT NEW LINE
            if (ctrl && shift && marked) {
                const newLine = new NewLine;
                if (marked instanceof NewLine) newLine.addVerticalShift();
                if (marked.getPrevChunk() instanceof NewLine) newLine.addVerticalShift();
                marked.getParentChunk().insertBefore(newLine, marked);
                this.save();
                return;
            }
            //INSERT SUBID
            if (ctrl && marked) {
                if (marked instanceof Id || marked instanceof SubId) {
                    const subId = new SubId();
                    this.addChunkAfterMarked(subId);
                    this.switchToInsertingMode(subId);
                    return;
                }
            }

            const inserter = this.astEditor.createEditNode(this);
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
                this.pubsub.pub(AST_NODE_EDIT_MODE);
                return;
            }*/

            if (marked instanceof ObjectItem) {
                const objectItem = new ObjectItem();
                objectItem.getKey().insert(inserter);

                if (marked.getNextChunk()) {
                } else {
                    marked.getParentChunk().insert(objectItem);
                    this.markSendEventAndFocus(inserter);
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
                this.markSendEventAndFocus(inserter);
                return;
            }
            if (marked instanceof ForConditionPart) {

                const forConditionPart = new ForConditionPart();
                marked.getParentChunk().insert(forConditionPart);
                this.switchToInsertingMode(forConditionPart);
                return;
            }
            if (marked instanceof ForCondition) {

                const forConditionPart = new ForConditionPart();
                marked.insert(forConditionPart);

                this.switchToInsertingMode(forConditionPart);
                return;
            }
            if (marked instanceof ConditionNode || marked instanceof BodyNode) {
                this.switchToInsertingMode(marked);
                return;
            }

            //INSERT INTO MARKED
            if (ctrl && marked) {
                this.switchToInsertingMode(marked instanceof If ? marked.getCondition() : marked);
                return;
            }
            if (marked instanceof NewLine && this.addChunkBeforeMarked(inserter)) {
                marked.removeVerticalShift();
                this.markSendEventAndFocus(inserter);
                return;
            }

            if (this.addChunkAfterMarked(inserter)) {
                this.markSendEventAndFocus(inserter);
                return;
            }
        }
    }

    moveLeft(isShift, isCtrl) {

        if (this.mainChunk.isEmpty()) this.switchToInsertingMode(this.mainChunk);
        if (this.marker.isEmpty()) return;

        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            if (marked instanceof ConditionNode) {
                const prevChunk = marked.getParentChunk().getPrevChunk();
                if (!prevChunk) return;
                this.marker.unmarkAll().mark(prevChunk);
                return;
            }
            if (marked instanceof BodyNode) {
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

            if (prevChunk instanceof NewLine && prevChunk.getPrevChunk() && !prevChunk.isShifted()) {
                prevChunk = prevChunk.getPrevChunk();
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

    moveLeftButNoNextChunk(marked, parent) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectValue) {

                const objectKey = objectKeyOrValue.getPrevChunk().getPrevChunk();
                if (objectKey.isEmpty()) {
                    this.switchToInsertingMode(objectKey);
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
        } else if (parent instanceof SubIdContainer) {

            const subId = parent.getParentChunk();
            if (subId.getPrevChunk()) {
                this.marker.unmarkAll().mark(subId.getPrevChunk());
            }
        }
    }

    moveRight(isShift, isCtrl) {

        if (this.marker.isEmpty()) {
            const chunk = this.mainChunk.getFirstChunk();
            if (!chunk) {
                this.switchToInsertingMode(this.mainChunk)
                return;
            }

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
                        this.switchToInsertingMode(ifChunk.getBody())
                    } else {
                        const first = ifChunk.getBody().getFirstChunk();
                        if (!first) return;
                        this.marker.mark(first);
                    }

                    return;
                }
                if (parent instanceof ForCondition) {

                    const forChunk = parent.getParentChunk();
                    if (forChunk.isBodyEmpty()) {
                        this.switchToInsertingMode(forChunk.getBody())
                    }
                    return;
                }
                if (parent instanceof ForConditionPartInternal) {

                    this.marker.unmarkAll();
                    const forChunk = parent.getParentChunk().getParentChunk().getParentChunk();
                    if (forChunk.isBodyEmpty()) {
                        this.pubsub.pub(AST_NODE_EDIT_MODE);
                        const inserter = this.astEditor.createEditNode(this);
                        forChunk.getBody().insert(inserter);
                        this.marker.mark(inserter);
                    }
                    return;
                }
            }

            if (marked instanceof ConditionNode) {
                const body = marked.getParentChunk().getBody();
                this.marker.unmarkAll().mark(body);
                return;
            }
            if (marked instanceof BodyNode) {
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
                    this.switchToInsertingMode(newForConditionPart);
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

            if (nextChunk instanceof NewLine && !nextChunk.isShifted()) {
                nextChunk = nextChunk.getNextChunk();
            }

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

    moveRightButNoNextChunk(marked, parent) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectKey) {

                const objectValue = objectKeyOrValue.getNextChunk().getNextChunk();
                if (objectValue.isEmpty()) {
                    const inserter = this.astEditor.createEditNode(this);
                    objectValue.insert(inserter);
                    this.markSendEventAndFocus(inserter);
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

    moveUp(isShift, isCtrl) {
        if (this.marker.isEmpty()) return;

        if (isCtrl) {

            const marked = this.marker.getFirst();
            let parent = marked.getParentChunk();
            if (!parent || parent instanceof Main) {
                return;
            }
            if (
                parent instanceof ForConditionPartInternal ||
                parent instanceof SurroundInternal ||
                parent instanceof ArrayBody ||
                parent instanceof ArrayItemParts ||
                parent instanceof ObjectItemParts ||
                parent instanceof ObjectBody ||
                parent instanceof SubIdContainer
            ) {
                parent = parent.getParentChunk();
            }

            this.marker.unmarkAll().mark(parent);
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

    moveDown(isShift, isCtrl) {

        if (this.marker.isEmpty()) {
            this.marker.mark(this.mainChunk.getFirstChunk());
            return;
        }

        const marked = this.marker.getFirst();
        const inserter = this.astEditor.createEditNode(this);

        if (isCtrl && !isShift) {

            if (marked instanceof Id) return;
            else if (marked instanceof Surround) {
                this.marker.unmarkAll().mark(marked.getFirstChunk());
            } else if (marked instanceof BodyNode) {

                if (marked.isEmpty()) {
                    this.switchToInsertingMode(marked);
                } else {
                    this.marker.unmarkAll().mark(marked.getFirstChunk());
                }

            } else if (marked instanceof ConditionAndBodyNode) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    this.switchToInsertingMode(marked.getCondition());
                } else {
                    this.marker.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof For) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    const forConditionPart = new ForConditionPart();
                    marked.insertInCondition(forConditionPart);
                    this.switchToInsertingMode(forConditionPart);
                } else {
                    this.marker.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof Call) {

                if (marked.isConditionEmpty()) {
                    const callConditionPart = new CallConditionPart();
                    marked.insertInCondition(callConditionPart);
                    this.switchToInsertingMode(callConditionPart);
                }

            } else if (marked instanceof Callable) {

                if (marked.isConditionEmpty()) {
                    const callableConditionPart = new CallableConditionPart();
                    marked.insertInCondition(callableConditionPart);

                    this.switchToInsertingMode(callableConditionPart);
                }

            }  else if (marked instanceof ForConditionPart) {

                const internal = marked.getInternal();
                if (internal.getFirstChunk()) this.marker.unmarkAll().mark(internal.getFirstChunk());

            } else if (marked instanceof ArrayChunk) {

                if (marked.isEmpty()) {
                    const arrayItem = new ArrayItem();
                    arrayItem.insert(inserter);
                    marked.insert(arrayItem);
                    this.markSendEventAndFocus(inserter);
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
                    this.markSendEventAndFocus(inserter);
                } else {
                    const body = marked.getBody();
                    this.marker.unmarkAll().mark(body.getFirstChunk());
                }

            } else if (marked instanceof ObjectKey) {

                //if empty insert inserter
                //else
                this.marker.unmarkAll().mark(marked.getFirstChunk().getFirstChunk());

            } else if (marked instanceof ObjectValue) {
                this.switchToInsertingMode(marked);
            } else if (marked instanceof SubId) {
                this.marker.unmarkAll().mark(marked.getFirstContainerNode());
            } else {
                const firstChunk = marked.getFirstChunk();
                if (firstChunk) this.marker.unmarkAll().mark(firstChunk);
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