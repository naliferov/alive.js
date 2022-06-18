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
import Pubsub from "../../../../io/pubsub/Pubsub";
import {AST_NODE_EDIT_MODE} from "../../../../io/pubsub/PubsubConstants";
import ForConditionPart from "../nodes/conditionAndBody/loop/ForConditionPart";
import ForConditionPartInternal from "../nodes/conditionAndBody/loop/ForConditionPartInternal";
import Nodes from "../../nodes/Nodes";
import AstSerializer from "../AstSerializer";
import Callable from "../nodes/conditionAndBody/call/callable/Callable";
import CallableConditionPart from "../nodes/conditionAndBody/call/callable/ConditionPart";
import AstNode from "../nodes/AstNode";
import SurroundInternal from "../nodes/surround/SurroundInternal";
import ConditionAndBodyNode from "../nodes/conditionAndBody/ConditionAndBodyNode";
import ConditionNode from "../nodes/conditionAndBody/ConditionNode";
import BodyNode from "../nodes/conditionAndBody/BodyNode";
import AstNodeEditor from "./AstNodeEditor";
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

export default class AstController {

    unit: T;
    pubsub: Pubsub;

    contextUnit;
    nodes: Nodes;
    linesNumbers: T;

    mainChunk: Main;
    marker: Marker;
    fxSerializer: AstSerializer;
    fxMutatorFactory: AstNodeEditor;

    constructor(
        context: T,
        pubsub: Pubsub,
        fxSerializer: AstSerializer,
        fxMutatorFactory: AstNodeEditor,
        nodes: Nodes
    ) {
        this.pubsub = pubsub;

        this.unit = new T({class: ['fxRuntimeController']});

        const markerMonitor = new T({class: ['markedNode'], name: 'markedNode: '});
        this.unit.in(markerMonitor);

        //const imports = new T({class: ['imports'], name: 'imports'});
        //this.unit.in(imports);

        const chunkContainer = new T({class: ['chunksContainer']});
        this.unit.in(chunkContainer);

        this.mainChunk = new Main();
        chunkContainer.in(this.mainChunk.getUnit());

        this.fxSerializer = fxSerializer;
        this.fxMutatorFactory = fxMutatorFactory;

        this.nodes = nodes;

        this.contextUnit = context;
        this.marker = new Marker(markerMonitor);

        const astNodes = this.contextUnit.getDataField('astNodes');
        if (!astNodes) {
            console.log(`fxSerialized not found in unit ${this.contextUnit.getId()}`);
            return;
        }

        this.fxSerializer.deserialize(this.mainChunk, astNodes.chunks);
    }

    show() { this.unit.show(); }
    hide() { this.unit.hide(); }
    getContextUnitId(): string { return this.contextUnit.getId(); }
    getUnit() { return this.unit; }

    async save() {
        this.contextUnit.setDataField('astNodes', {
            chunks: this.fxSerializer.serialize(this.mainChunk),
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
            this.fxMutatorFactory.editNode(this.marker.getFirst(), this);
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

    removeChunk(chunk: AstNode) {
        chunk.remove();
        if (chunk.getId()) {
            // @ts-ignore
            window.astNodesPool.delete(chunk.getId());
        }
    }

    unmarkAll() { return this.marker.unmarkAll(); }
    mark(chunk: AstNode) { this.marker.mark(chunk); }

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

    switchToInsertingMode(chunk: AstNode) {
        const inserter = this.fxMutatorFactory.createEditNode(this);
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
                    marked.putSubId(subId);
                    this.switchToInsertingMode(subId);
                    return;
                }
            }

            const inserter = this.fxMutatorFactory.createEditNode(this);
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
            if (this.addChunkAfterMarked(inserter)) {
                this.markSendEventAndFocus(inserter);
            }
        }
    }

    moveLeft(isShift: boolean, isCtrl: boolean) {

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

    moveLeftButNoNextChunk(marked: AstNode, parent: AstNode) {

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
        }
    }

    moveRight(isShift: boolean, isCtrl: boolean) {

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
                        const inserter = this.fxMutatorFactory.createEditNode(this);
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

    moveRightButNoNextChunk(marked: AstNode, parent: AstNode) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectKey) {

                const objectValue = objectKeyOrValue.getNextChunk().getNextChunk();
                if (objectValue.isEmpty()) {
                    const inserter = this.fxMutatorFactory.createEditNode(this);
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

    moveUp(isShift: boolean, isCtrl: boolean) {
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

    moveDown(isShift: boolean, isCtrl: boolean) {

        if (this.marker.isEmpty()) {
            this.marker.mark(this.mainChunk.getFirstChunk());
            return;
        }

        const marked = this.marker.getFirst();
        const inserter = this.fxMutatorFactory.createEditNode(this);

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