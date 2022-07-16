import V from '../../../../type/V.js';
import NewLine from "../nodes/NewLine.js";
import Id from "../nodes/id/Id.js";
import SubId from "../nodes/id/SubId.js";
import SubIdContainer from "../nodes/id/SubIdContainer.js";
import If from "../nodes/conditionAndBody/if/If.js";
import Surround from "../nodes/surround/Surround.js";
import Marker from "../Marker.js";
import IfCondition from "../nodes/conditionAndBody/if/IfCondition.js";
import IfBody from "../nodes/conditionAndBody/if/IfBody.js";
import For from "../nodes/conditionAndBody/loop/For.js";
import Main from "../nodes/Main.js";
import ForCondition from "../nodes/conditionAndBody/loop/ForCondition.js";
import ForConditionPart from "../nodes/conditionAndBody/loop/ForConditionPart.js";
import ForConditionPartInternal from "../nodes/conditionAndBody/loop/ForConditionPartInternal.js";
import Callable from "../nodes/conditionAndBody/call/callable/Callable.js";
import CallableConditionPart from "../nodes/conditionAndBody/call/callable/CallableConditionPart.js";
import SurroundInternal from "../nodes/surround/SurroundInternal.js";
import ConditionAndBodyNode from "../nodes/conditionAndBody/ConditionAndBodyNode.js";
import ConditionNode from "../nodes/conditionAndBody/ConditionNode.js";
import BodyNode from "../nodes/conditionAndBody/BodyNode.js";
import ArrayChunk from "../nodes/literal/array/ArrayChunk.js";
import ArrayItem from "../nodes/literal/array/ArrayItem.js";
import ArrayItemParts from "../nodes/literal/array/ArrayItemParts.js";
import ArrayBody from "../nodes/literal/array/ArrayBody.js";
import ObjectChunk from "../nodes/literal/object/ObjectChunk.js";
import ObjectItem from "../nodes/literal/object/ObjectItem.js";
import ObjectItemParts from "../nodes/literal/object/ObjectItemParts.js";
import ObjectKey from "../nodes/literal/object/ObjectKey.js";
import ObjectValue from "../nodes/literal/object/ObjectValue.js";
import ObjectBody from "../nodes/literal/object/ObjectBody.js";
import Call from "../nodes/conditionAndBody/call/call/Call.js";
import CallConditionPart from "../nodes/conditionAndBody/call/call/CallConditionPart.js";
import Module from "../nodes/module/Module.js";
import ModuleBody from "../nodes/module/ModuleBody.js";
import ModuleImports from "../nodes/module/import/ModuleImports.js";
import ModuleCallableCondition from "../nodes/module/ModuleCallableCondition.js";
import Import from "../nodes/module/import/Import.js";

export default class AstEditor {

    v;

    mainNode;
    moduleNode;

    contextNode;

    callableModule;

    nodes;

    marker;
    serializer;
    astNodeEditor;

    constructor(
        contextNode,
        serializer,
        astNodeEditor,
        nodes
    ) {
        this.contextNode = contextNode;
        this.astNodeEditor = astNodeEditor;
        this.serializer = serializer;
        this.nodes = nodes;


        this.v = new V({class: 'astEditor'});

        const markerMonitor = new V({class: 'markedNode', txt: 'Marked node: []'});
        e('>', [markerMonitor, this.v]);
        this.marker = new Marker(markerMonitor);

        this.mainNode = new Main();
        e('>', [this.mainNode.getV(), this.v]);

        this.moduleNode = new Module();
        this.mainNode.insert(this.moduleNode);

        this.renderAST();
    }

    getLastASTVersion() {
        let AST = this.contextNode.get('AST');
        if (!AST) {
            console.log(`AST not found in unit ${this.contextNode.get('id')}.`);
            return;
        }

        AST.currentVersion = AST.currentVersion ?? AST.versions.length - 1;
        console.log(this.contextNode.get('name'), AST.currentVersion);

        return AST.versions[AST.currentVersion];
    }

    renderAST() {
        this.moduleNode.clear();
        try {
            const ASTVersion = this.getLastASTVersion();
            this.serializer.deserialize(this.moduleNode, ASTVersion);
            //console.log(`version: ${AST.currentVersion}/${AST.versions.length - 1}`);
        } catch (e) {
            console.log('Deserialization fails.', this.contextNode, e);
        }
    }

    show() { this.v.show(); }
    hide() { this.v.hide(); }
    getV() { return this.v; }
    getContextModuleType() { return this.contextNode.get('moduleType') ?? 'simple'; }

    switchModuleType() {

        console.log('test');
        //const moduleType = this.getContextModuleType();

        //this.callableModule = new CallableModule;
        //this.callableModule.insert(this.flow);
        //this.mainNode.insert(this.callableModule);
    }

    switchASTToPrevVersion() {
        let AST = this.contextNode.get('AST');
        if (AST.currentVersion <= 0) return;

        AST.currentVersion--;
        this.unmarkAll();
        this.renderAST();
        console.log('switch to AST to prev version.');
    }

    switchASTToNextVersion() {
        let AST = this.contextNode.get('AST');
        if (AST.currentVersion >= AST.versions.length - 1) return;

        AST.currentVersion++;
        this.unmarkAll();
        this.renderAST();
        console.log('switch to AST to next version.');
    }

    async save() {

        let AST = this.contextNode.get('AST') ?? {}
        AST.versions = AST.versions ?? [];
        AST.versions.push(this.serializer.serialize(this.moduleNode));
        AST.currentVersion = AST.versions.length - 1;

        this.contextNode.set('AST', AST);

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

                const marked = this.marker.getFirst();
                if (
                    marked instanceof ModuleBody ||
                    marked instanceof ModuleCallableCondition ||
                    marked instanceof ModuleImports
                ) { return; }

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
            this.astNodeEditor.editNode(this.marker.getFirst(), this);
            //setTimeout(() => this.pubsub.pub(AST_CONTROL_MODE), 300);

            return;
        }
        if (ctrl && code === 'KeyL') {

            e.preventDefault();
            if (this.marker.isEmpty()) {
                this.switchModuleType();
                return;
            }

            const marked = this.marker.getFirst();
            if (marked instanceof Id) marked.switchKeyword();
            if (marked instanceof Module) this.switchModuleType();
            this.save();
            return;
        }
        if (ctrl && code === 'KeyC') {
            e.preventDefault();
            return;
        }
        if (ctrl && k === 'KeyC') {
            e.preventDefault();

            /*const lastLine = (this.linesList.getLength() - 1) === y;

            const line = this.linesList.get(y);
            line.removeFromDom();
            this.linesList.del(y);

            if (lastLine) this.cursor.up();

            this.syncLinesNumbers(this.linesList.getLength());

            this.save();*/
        }

        if (ctrl && code === 'KeyZ') {
            e.preventDefault();

            console.log('undo');
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
        e('>after', [chunk.getV(), marked.getV()]);
        return true;
    }

    addChunkBeforeMarked(chunk) {
        if (this.marker.isEmpty()) return;
        if (this.marker.getLength() !== 1) return;

        e('>before', [chunk.getV(), this.marker.getFirst().getV()]);
        return true;
    }

    removeChunk(chunk) {
        chunk.remove();
        if (chunk.getId()) window.astPool.delete(chunk.getId());
    }

    unmarkAll() {
        this.marker.unmarkAll()
        return this;
    }
    mark(ASTNode) {
        this.marker.mark(ASTNode);
        e('markASTNode', [this.contextNode, ASTNode]);
    }

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
                    if (chunkForMarking) this.unmarkAll().mark(chunkForMarking);
                    else this.unmarkAll().mark(array);
                }

                this.save();
                return;
            }

            if (prevChunk instanceof NewLine && !prevChunk.hasVerticalShift()) {
                if (prevChunk.getPrevChunk()) {
                    this.unmarkAll().mark(prevChunk.getPrevChunk());
                }
                this.removeChunk(marked);
                this.removeChunk(prevChunk);
                this.save();
                return;
            }

            if (marked instanceof Module) {
                console.log('You can not delete Module node.');
                return;
            }

            if (chunkForMarking) this.unmarkAll().mark(chunkForMarking);
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

    switchToEditMode(chunk) {
        const inserter = this.astNodeEditor.createEditNode(this);
        chunk.insert(inserter);
        this.unmarkAll().mark(inserter);
        e('astNodeEditMode');
        inserter.focus();
    }

    markSendEventAndFocus(editNode) {
        this.unmarkAll().mark(editNode);
        e('astNodeEditMode');
        editNode.focus();
    }

    enterBtn(shift = false, ctrl = false) {

        if (this.marker.isEmpty()) {
            this.switchToEditMode(this.moduleNode);
            return;
        }
        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            //INSERT NEW LINE
            if (ctrl && shift && marked) {
                const newLine = new NewLine;
                if (
                    marked instanceof NewLine ||
                    marked.getPrevChunk() instanceof NewLine
                ) {
                    newLine.addVerticalShift();
                }

                e('>before', [newLine.getV(), marked.getV()]);
                this.save();
                return;
            }
            //INSERT SUBID IN ID
            if (ctrl && marked) {
                if (marked instanceof Id || marked instanceof SubId) {
                    const subId = new SubId();
                    this.addChunkAfterMarked(subId);
                    this.switchToEditMode(subId);
                    return;
                }
            }

            if (marked instanceof ModuleCallableCondition) return;

            const inserter = this.astNodeEditor.createEditNode(this);
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
                this.switchToEditMode(forConditionPart);
                return;
            }
            if (marked instanceof ForCondition) {

                const forConditionPart = new ForConditionPart();
                marked.insert(forConditionPart);

                this.switchToEditMode(forConditionPart);
                return;
            }
            if (marked instanceof ConditionNode || marked instanceof BodyNode) {
                this.switchToEditMode(marked);
                return;
            }
            if (marked instanceof ModuleImports) {
                const importNode = new Import();
                marked.insert(importNode);
                this.switchToEditMode(importNode.getImportName());
                return;
            }
            if (marked instanceof Import) {
                const importNode = new Import();
                marked.insert(importNode);
                if (this.addChunkAfterMarked(importNode)) {
                    this.switchToEditMode(importNode.getImportName());
                }
                return;
            }


            //INSERT INTO MARKED
            if (ctrl && marked) {
                this.switchToEditMode(marked instanceof If ? marked.getCondition() : marked);
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

        if (this.moduleNode.isEmpty()) this.switchToEditMode(this.moduleNode);
        if (this.marker.isEmpty()) return;

        if (this.marker.getLength() === 1) {

            const marked = this.marker.getFirst();
            const parent = marked.getParentChunk();

            if (marked instanceof ConditionNode) {
                const prevChunk = marked.getParentChunk().getPrevChunk();
                if (!prevChunk) return;
                this.unmarkAll().mark(prevChunk);
                return;
            }
            if (marked instanceof BodyNode) {
                this.unmarkAll().mark(marked.getParentChunk().getCondition());
                return;
            }
            if (parent instanceof ForConditionPartInternal) {

                const forConditionPart = parent.getParentChunk();
                const prevForConditionPart = forConditionPart.getPrevChunk();

                if (!marked.getPrevChunk() && prevForConditionPart && prevForConditionPart.getLastChunk()) {
                    this.unmarkAll().mark(prevForConditionPart.getLastChunk());
                    return;
                }
            }
            if (marked instanceof ObjectValue) {
                this.unmarkAll().mark(marked.getPrevChunk().getPrevChunk());
                return;
            }

            let prevChunk = marked.getPrevChunk();
            if (!prevChunk) {
                this.moveLeftButNoNextChunk(marked, parent);
                return;
            }

            if (isShift) {
                this.marker.setDirection('left');
                this.mark(prevChunk)
                return;
            }

            if (prevChunk instanceof NewLine && prevChunk.getPrevChunk() && !prevChunk.isShifted()) {
                prevChunk = prevChunk.getPrevChunk();
            }

            this.unmarkAll().mark(prevChunk)
            return;
        }

        if (this.marker.getLength() > 1) {

            let marked = this.marker.getLast();
            let chunk = marked.getPrevChunk();
            if (!chunk) return;

            const isLeftDirection = this.marker.getDirection() === 'left';

            if (isShift) {
                if (isLeftDirection) this.mark(chunk);
                else this.marker.unmark(marked);
            } else {
                if (chunk instanceof NewLine) chunk = marked.getPrevChunk();
                this.unmarkAll().mark(chunk);
            }
        }
    }

    moveLeftButNoNextChunk(marked, parent) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectValue) {

                const objectKey = objectKeyOrValue.getPrevChunk().getPrevChunk();
                if (objectKey.isEmpty()) {
                    this.switchToEditMode(objectKey);
                } else {
                    this.unmarkAll().mark(objectKey.getLastChunk());
                }
            }
        } else if (parent instanceof IfBody) {

            const ifCondition = parent.getParentChunk().getCondition();
            if (ifCondition.getLastChunk()) {
                this.unmarkAll().mark(ifCondition.getLastChunk());
            } else {
                this.switchToEditMode(ifCondition);
            }
        } else if (parent instanceof SubIdContainer) {

            const subId = parent.getParentChunk();
            if (subId.getPrevChunk()) {
                this.unmarkAll().mark(subId.getPrevChunk());
            }
        }
    }

    moveRight(isShift, isCtrl) {

        if (this.marker.isEmpty()) {
            const chunk = this.moduleNode.getFirstChunk();
            if (!chunk) {
                this.switchToEditMode(this.moduleNode)
                return;
            }

            this.mark(chunk);
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
                        this.switchToEditMode(ifChunk.getBody())
                    } else {
                        const first = ifChunk.getBody().getFirstChunk();
                        if (!first) return;
                        this.mark(first);
                    }

                    return;
                }
                if (parent instanceof ForCondition) {

                    const forChunk = parent.getParentChunk();
                    if (forChunk.isBodyEmpty()) {
                        this.switchToEditMode(forChunk.getBody())
                    }
                    return;
                }
                if (parent instanceof ForConditionPartInternal) {

                    this.marker.unmarkAll();
                    const forChunk = parent.getParentChunk().getParentChunk().getParentChunk();
                    if (forChunk.isBodyEmpty()) {
                        //this.pubsub.pub(AST_NODE_EDIT_MODE);
                        const inserter = this.astNodeEditor.createEditNode(this);
                        forChunk.getBody().insert(inserter);
                        this.mark(inserter);
                    }
                    return;
                }
            }

            if (marked instanceof ConditionNode) {
                const body = marked.getParentChunk().getBody();
                this.unmarkAll().mark(body);
                return;
            }
            if (marked instanceof BodyNode) {
                const conditionBodyChunk = marked.getParentChunk();
                if (conditionBodyChunk.getNextChunk()) this.unmarkAll().mark(conditionBodyChunk.getNextChunk());
                return;
            }
            if (marked instanceof ForCondition) {
                const forBody = marked.getParentChunk().getBody();
                this.unmarkAll().mark(forBody);
                return;
            }
            if (parent instanceof ForConditionPartInternal) {

                if (!marked.getNextChunk()) {

                    const forConditionPart = parent.getParentChunk();
                    const forCondition = forConditionPart.getParentChunk();

                    if (forConditionPart.getNextChunk()) {
                        this.unmarkAll().mark(forConditionPart.getNextChunk().getFirstChunk().getFirstChunk());
                        return;
                    }

                    const newForConditionPart = new ForConditionPart();
                    forCondition.getParentChunk().insertInCondition(newForConditionPart);
                    this.switchToEditMode(newForConditionPart);
                    return;
                }

            }
            if (marked instanceof ObjectKey) {
                this.unmarkAll().mark(marked.getNextChunk().getNextChunk());
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
                this.mark(nextChunk);
                return;
            }

            if (!nextChunk) return;

            if (nextChunk instanceof NewLine && !nextChunk.isShifted()) {
                nextChunk = nextChunk.getNextChunk();
            }

            if (!nextChunk) return;
            this.unmarkAll().mark(nextChunk);
            return;
        }

        if (this.marker.getLength() > 1) {

            let marked = this.marker.getLast();
            let chunk = marked.getNextChunk();
            if (chunk instanceof NewLine) chunk = marked.getNextChunk();
            if (!chunk) return;

            if (isShift) {
                if (this.marker.getDirection() === 'right') this.mark(chunk);
                else this.marker.unmark(marked);
            } else {
                this.unmarkAll().mark(chunk);
            }
        }
    }

    moveRightButNoNextChunk(marked, parent) {

        if (parent instanceof ObjectItemParts) {

            const objectKeyOrValue = parent.getParentChunk();
            if (objectKeyOrValue instanceof ObjectKey) {

                const objectValue = objectKeyOrValue.getNextChunk().getNextChunk();
                if (objectValue.isEmpty()) {
                    const inserter = this.astNodeEditor.createEditNode(this);
                    objectValue.insert(inserter);
                    this.markSendEventAndFocus(inserter);
                } else {
                    this.unmarkAll().mark(objectValue.getFirstChunk());
                }
            }
        } else if (parent instanceof IfCondition) {

            const ifBody = parent.getParentChunk().getBody();
            if (ifBody.getFirstChunk()) {
                this.unmarkAll().mark(ifBody.getFirstChunk());
            } else {
                this.switchToEditMode(ifBody);
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

            this.unmarkAll().mark(parent);
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
                this.mark(prevChunk);
            }

            return;
        }
    }
    moveDown(isShift, isCtrl) {

        if (this.marker.isEmpty()) {
            this.mark(this.mainNode.getFirstChunk());
            return;
        }

        const marked = this.marker.getFirst();
        const inserter = this.astNodeEditor.createEditNode(this);

        if (isCtrl && !isShift) {

            if (marked instanceof Id) {
                return;
            } else if (marked instanceof ModuleImports && marked.isEmpty()) {

                const importNode = new Import();
                marked.insert(importNode);
                this.switchToEditMode(importNode.getImportName());

            } else if (marked instanceof ModuleCallableCondition) {

                if (marked.isEmpty()) {
                    const moduleCallableCondition = marked.getBody();
                    const callableConditionPart = new CallableConditionPart();
                    moduleCallableCondition.insert(callableConditionPart);

                    this.switchToEditMode(callableConditionPart);
                } else {
                    this.unmarkAll().mark(marked.getBody());
                }

            } else if (marked instanceof Surround) {
                this.unmarkAll().mark(marked.getFirstChunk());
            } else if (marked instanceof BodyNode) {

                if (marked.isEmpty()) {
                    this.switchToEditMode(marked);
                } else {
                    this.unmarkAll().mark(marked.getFirstChunk());
                }

            } else if (marked instanceof ConditionAndBodyNode) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    this.switchToEditMode(marked.getCondition());
                } else {
                    this.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof For) {

                if (marked.isConditionEmpty() && marked.isBodyEmpty()) {
                    const forConditionPart = new ForConditionPart();
                    marked.insertInCondition(forConditionPart);
                    this.switchToEditMode(forConditionPart);
                } else {
                    this.unmarkAll().mark(marked.getCondition());
                }

            } else if (marked instanceof Call) {

                if (marked.isConditionEmpty()) {
                    const callConditionPart = new CallConditionPart();
                    marked.insertInCondition(callConditionPart);
                    this.switchToEditMode(callConditionPart);
                }

            } else if (marked instanceof Callable) {

                if (marked.isConditionEmpty()) {
                    const callableConditionPart = new CallableConditionPart();
                    marked.insertInCondition(callableConditionPart);

                    this.switchToEditMode(callableConditionPart);
                }

            }  else if (marked instanceof ForConditionPart) {

                const internal = marked.getInternal();
                if (internal.getFirstChunk()) this.unmarkAll().mark(internal.getFirstChunk());

            } else if (marked instanceof ArrayChunk) {

                if (marked.isEmpty()) {
                    const arrayItem = new ArrayItem();
                    arrayItem.insert(inserter);
                    marked.insert(arrayItem);
                    this.markSendEventAndFocus(inserter);
                } else {
                    const body = marked.getBody();
                    this.unmarkAll().mark(body.getFirstChunk());
                }

            } else if (marked instanceof ArrayItem) {
                this.unmarkAll().mark(marked.getItemParts().getFirstChunk());

            } else if (marked instanceof ObjectChunk) {

                if (marked.isEmpty()) {
                    const objectItem = new ObjectItem();

                    objectItem.getKey().insert(inserter);
                    marked.insert(objectItem);
                    this.markSendEventAndFocus(inserter);
                } else {
                    const body = marked.getBody();
                    this.unmarkAll().mark(body.getFirstChunk());
                }

            } else if (marked instanceof ObjectKey) {
                this.unmarkAll().mark(marked.getFirstChunk().getFirstChunk());

            } else if (marked instanceof ObjectValue) {
                this.switchToEditMode(marked);
            } else if (marked instanceof SubId) {
                this.unmarkAll().mark(marked.getFirstContainerNode());
            } else if (marked.isEmpty()) {
                this.switchToEditMode(marked);
            } else {
                const firstChunk = marked.getFirstChunk();
                if (firstChunk) this.unmarkAll().mark(firstChunk);
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
                this.unmarkAll().mark(nextChunk);
            }
        }
    }

    close() { this.v.removeFromDom(); }
}