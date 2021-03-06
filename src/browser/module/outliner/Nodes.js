import {cloneObject, uuid} from "../../../F.js";
import OutlinerNode from "./OutlinerNode.js";
import HttpClient from "../../../io/http/HttpClient.js";
import Node from "../../../type/Node.js"
import V from "../../../type/V.js";

export default class Nodes {

    v;
    outLinerRootNode;

    constructor() { this.v = new V({class: 'nodes'}); }
    getV() { return this.v; }

    async init() {

        const nodes = (await (new HttpClient).get('/nodes')).data;
        //if (nodes.length) this.addNodeBtn.hide();

        const rootNode = new Node();
        rootNode.set('nodes', nodes);

        const outlinerRootNode = new OutlinerNode(rootNode);
        outlinerRootNode.removeSubNodesShift();


        this.outLinerRootNode = outlinerRootNode;
        e('>', [outlinerRootNode, this.getV()]);

        const render = (outlinerNode) => {

            const node = outlinerNode.getContextNode();
            const subNodes = node.get('nodes');
            if (!Array.isArray(subNodes)) return;

            for (let i = 0; i < subNodes.length; i++) {
                const newNode = new Node(subNodes[i]);
                const newOutlinerNode = new OutlinerNode(newNode);
                e('>', [newOutlinerNode.getV(), outlinerNode.getNodesV()]);

                window.nodesPool.set(newNode.get('id'), newNode);
                window.outlinerPool.set(newOutlinerNode.getDomId(), newOutlinerNode);
                render(newOutlinerNode);
            }
        }

        render(outlinerRootNode);
    }

    isEmpty() { return this.outLinerRootNode.isEmpty()}
    getNodeById(id) { return window.nodesPool.get(id); }
    getOutlinerNodeById(id) { return window.outlinerPool.get(id); }

    async handleKeyDown(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
        if (!outlinerNode) { console.log('outlinerNode not found'); return; }

        const k = e.key;
        const ctrl = e.ctrlKey || e.metaKey;

        if (k === 'Enter') {
            e.preventDefault();
            this.copy(outlinerNode);
        } else if (k === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                const parent = outlinerNode.getParent();
                window.e('>after', [outlinerNode.getV(), parent.getV()]);
            } else if (outlinerNode.prev()) {
                window.e('>', [outlinerNode.getV(), outlinerNode.prev().getNodesV()]);
            }

        } else if (ctrl && k === 'ArrowUp' && outlinerNode.prev()) {
            window.e('>after', [outlinerNode.prev().getV(), outlinerNode.getV()]);
        } else if (ctrl && k === 'ArrowDown' && outlinerNode.next()) {
            window.e('>after', [outlinerNode.getV(), outlinerNode.next().getV()]);
        } else {
            return;
        }

        e.target.focus();
        await this.save();
    }

    async handleKeyUp(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const ignoreKeys = ['Enter', 'Tab', 'Control', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (new Set(ignoreKeys).has(e.key)) return;

        const outlinerNode = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id'));
        const node = outlinerNode.getContextNode();
        node.set('name', e.target.innerText);

        if (e.target.innerText.length === 0) {

            const calcSubUnits = (nodesArr) => {
                let count = 0;

                for (let i = 0; i < nodesArr.length; i++) {
                    count++;
                    const node = nodesArr[i];
                    count += node.get('nodes') ? calcSubUnits(node.get('nodes')) : 0;
                }
                return count;
            }

            node.get('nodes') ? console.log(calcSubUnits(node.get('nodes'))) : 0

            const totalNodes = node.get('nodes') ? calcSubUnits(node.get('nodes')) : 0;
            if (totalNodes > 5) {
                if (confirm(`Really want to delete element with [${totalNodes}] nodes?`)) {
                    this.delete(outlinerNode);
                }
            } else {
                this.delete(outlinerNode);
            }

        }

        await this.save();
    }

    async handleDblClick(e) {

        if (e.target.classList.contains('dataUnit')) {
            let node = this.getOutlinerNodeById(e.target.getAttribute('outliner_node_id')).getContextNode();
            window.e('openTab', {node});
            return;
        }
        if (!e.target.classList.contains('openClose')) return;

        await this.save();
    }

    copy(outlinerNode) {

        let nodeData = cloneObject(outlinerNode.getContextNode().getData());
        nodeData.id = uuid();
        if (nodeData.name) nodeData.name += '_copy';
        delete nodeData.nodes;

        const newNode = new Node(nodeData);
        const newOutlinerNode = new OutlinerNode(newNode);

        e('>after', [newOutlinerNode.getV(), outlinerNode.getV()]);
        window.outlinerPool.set(newOutlinerNode.getDomId(), newOutlinerNode);
    }

    create(outlinerNode) {
        const newNode = new Node({id: uuid(), name: 'New node'});
        const newOutlinerNode = new OutlinerNode(newNode);
        e('>', [newOutlinerNode.getV(), outlinerNode.getNodesV()]);
        window.outlinerPool.set(newOutlinerNode.getDomId(), newOutlinerNode);
    }

    delete(outlinerNode) {
        window.nodesPool.delete(outlinerNode.getContextNode().get('id'));
        window.outlinerPool.delete(outlinerNode.getDomId());
        outlinerNode.getV().removeFromDom();
    }

    async save() {

        const getNodesData = (outlinerNode) => {

            const r = [];

            for (let outlinerNodeDom of outlinerNode.getNodesV().getDOM().children) {

                const outlinerNode = window.outlinerPool.get(outlinerNodeDom.getAttribute('id'));
                const node = outlinerNode.getContextNode();

                let tData = {id: node.get('id'), name: node.get('name')};

                const subNodes = getNodesData(outlinerNode);
                if (subNodes.length > 0) tData.nodes = subNodes;
                if (node.get('AST')) tData.AST = node.get('AST');

                r.push(tData);
            }
            return r;
        }

        const nodes = getNodesData(this.outLinerRootNode);
        //console.log(nodes);
        await new HttpClient().post('/nodes', {nodes})
    }
}