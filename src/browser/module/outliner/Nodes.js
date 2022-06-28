import {cloneObject, uuid} from "../../../F.js";
import OutlinerNode from "./OutlinerNode.js";
import {OPEN_TAB} from "../../../io/EConstants.js";
import HttpClient from "../../../io/http/HttpClient.js";
import Node from "../../../type/Node.js"
import V from "../../../type/V.js";

export default class Nodes {

    dom;
    rootNode;
    addNodeBtn;

    constructor() {
        this.dom = new V({class: ['nodes']});
    }
    getDom() { return this.dom; }

    async init() {

        this.addNodeBtn = new V({class: ['addBtn'], txt: 'Add node'});
        e('>', this.addNodeBtn, this.dom);

        this.addNodeBtn.on('click', (e) => {
            this.addNodeBtn.hide();
            this.create(this.rootNode);
        });

        const nodes = (await (new HttpClient).get('/nodes')).data;
        if (nodes.length) this.addNodeBtn.hide();

        const rootNode = new Node();
        rootNode.set('nodes', nodes);

        const outlinerRootNode = new OutlinerNode(rootNode);
        e('>', outlinerRootNode.getDom(), this.dom);

        //this.rootNode.get().oEditMode();

        const render = (outlinerNode) => {

            const node = outlinerNode.getContextNode();
            const subNodes = node.get('nodes');

            if (!Array.isArray(subNodes)) return;

            for (let i = 0; i < subNodes.length; i++) {

                const newNode = new Node(subNodes[i]);
                const newOutlinerNode = new OutlinerNode(newNode);

                console.log(newNode);
                //outlinerNode.insert(newOutlinerNode);
                //this.setTById(unit.getId(), unit);
                //render(newOutlinerNode);
            }
        }

        render(outlinerRootNode);
    }

    isEmpty() { return this.rootNode.isEmpty()}

    getTById(id) { return window.nodesPool.get(id); }
    setTById(id, t) { window.nodesPool.set(id, t); }
    getOutlinerNodeById(id) { return window.outlinerNodesPool.get(id); }

    async handleKeyDown(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const node = this.getOutlinerNodeById(e.target.getAttribute('nid'));

        const k = e.key;
        const ctrl = e.ctrlKey || e.metaKey;

        if (k === 'Enter') {
            e.preventDefault();
            this.copy(node);
        } else if (k === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                const parent = node.getParent();
                const parentOfParent = parent.getParent();

                if (parent.next()) node.insertBefore(parent.next());
                else parentOfParent.insert(node);

            } else if (node.prev()) node.prev().insert(node);

        } else if (ctrl && k === 'ArrowUp' && node.prev()) {
            node.insertBefore(node.prev());
            e.target.focus();
        } else if (ctrl && k === 'ArrowDown' && node.next()) {
            node.next().insertBefore(node);
            e.target.focus();
        } else {
            return;
        }

        await this.save();
    }

    async handleKeyUp(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const ignoreKeys = ['Enter', 'Tab', 'Control', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (new Set(ignoreKeys).has(e.key)) return;

        const node = this.getOutlinerNodeById(e.target.getAttribute('nid'));
        const unit = node.getDataUnit();
        unit.setNameToData(e.target.innerText);

        if (e.target.innerText.length === 0) {

            const calcSubUnits = (units) => {
                let count = units.length;
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i];
                    count += unit.nodes ? calcSubUnits(unit.nodes) : 0;
                }
                return count;
            }

            const totalUnits = unit.getData().nodes ? calcSubUnits(unit.getData().nodes) : 0;
            if (unit.getData().nodes && totalUnits > 5) {
                if (confirm(`Really want to delete element with [${totalUnits}] units?`)) {

                }
            } else {
                this.delete(node);
            }
        }

        await this.save();
    }

    async handleClick(e) {

        if (e.target.classList.contains('dataUnit')) {
            let unit = this.getOutlinerNodeById(e.target.getAttribute('nid')).getContextT();
            window.e(OPEN_TAB, {unit});
            return;
        }
        if (!e.target.classList.contains('openClose')) return;

        await this.save();
    }

    copy(outlinerNode) {

        let nodeData = cloneObject(outlinerNode.getDataUnit().getData());
        nodeData.id = uuid();
        delete nodeData.nodes;
        delete nodeData.units;

        const newNode = new Node(nodeData);
        const newOutlinerNode = new OutlinerNode(newNode);

        if (outlinerNode.next()) {
            newNode.insertBefore(outlinerNode.next());
        } else {
            node.getParent().insert(newNode);
        }
        this.setTById(newUnit.getId(), newUnit);
    }

    create(node) {

        const newUnit = new OutlinerNode({
            id: uuid(),
            name: 'New node',
        });
        const newNode = new OutlinerNode(newUnit);
        node.insert(newNode);
        this.setTById(newUnit.getId(), newUnit);
    }

    delete(node) {
        window.nodesPool.delete(node.getDataUnit().getId());
        window.outlinerNodesPool.delete(node.getDomId());
        node.getT().removeFromDom();
    }

    async save() {

        const getNodesData = (node) => {

            const r = [];

            for (let nodeDom of node.getNodes().getDOM().children) {

                const nodeObject = window.outlinerNodesPool.get(nodeDom.getAttribute('id'));
                const unitData = nodeObject.getDataUnit().getData();

                let tData = {id: unitData.id, name: unitData.name};
                const subNodes = getNodesData(nodeObject);
                if (subNodes.length > 0) tData.nodes = subNodes;
                if (unitData.astNodes) tData.astNodes = unitData.astNodes;
                if (unitData.moduleType) tData.moduleType = unitData.moduleType;

                r.push(tData);
            }
            return r;
        }
        const nodes = getNodesData(this.rootNode);

        console.log(nodes);

        /*for (let i = 0; i < outliner.length; i++) {
            if (outliner[i].name === 'main') {
                console.log(outliner[i]);
                break;
            }
        }*/
       // await new HttpClient().post('/outliner', {outliner})
    }
}