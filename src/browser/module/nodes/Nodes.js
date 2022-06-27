import T from "../../../type/T";
import {cloneObject, uuid} from "../../../F";
import Node from "./Node";
import {OPEN_TAB} from "../../../io/pubsub/PubsubConstants";
import HttpClient from "../../../io/http/HttpClient";

export default class Nodes {

    t;
    rootNode;
    addNodeBtn;
    pubsub;

    constructor(pubsub) { this.pubsub = pubsub; }
    getUnit() { return this.t; }

    async init(app) {

        this.t = new T({class: ['nodes']});
        app.insert(this.t);

        const nodes = (await (new HttpClient).get('/nodes')).data;

        this.addNodeBtn = new T({class: ['addBtn'], name: 'Add node'});
        this.t.insert(this.addNodeBtn);
        this.addNodeBtn.on('click', (e) => {
            this.addNodeBtn.hide();
            this.create(rootNode);
        });
        if (nodes.length) this.addNodeBtn.hide();

        const rootNode = new Node(new T({class: ['root'], nodes}));
        this.t.insert(rootNode.getUnit());
        this.rootNode = rootNode;
        this.rootNode.getDataUnit().oEditMode();

        const render = (node) => {

            const subNodes = node.getDataUnit().getNodes();
            if (!Array.isArray(subNodes)) return;

            for (let i = 0; i < subNodes.length; i++) {

                const unit = new T(subNodes[i]);
                const newNode = new Node(unit);

                node.insert(newNode);
                this.setTById(unit.getId(), unit);
                render(newNode);
            }
        }

        render(rootNode);
    }

    isEmpty() { return this.rootNode.isEmpty()}

    getTById(id) { return window.tPool.get(id); }
    setTById(id, t) { window.tPool.set(id, t); }
    getNodeById(id) { return window.nodesPool.get(id); }

    async handleKeyDown(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const node = this.getNodeById(e.target.getAttribute('nid'));

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

        const node = this.getNodeById(e.target.getAttribute('nid'));
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
            let unit = this.getNodeById(e.target.getAttribute('nid')).getContextT();
            this.pubsub.pub(OPEN_TAB, {unit});
            return;
        }
        if (!e.target.classList.contains('openClose')) return;

        await this.save();
    }

    copy(node) {

        let unitData = cloneObject(node.getDataUnit().getData());
        unitData.id = uuid();
        delete unitData.nodes;
        delete unitData.units;

        const newUnit = new T(unitData);
        const newNode = new Node(newUnit);

        if (node.next()) {
            newNode.insertBefore(node.next());
        } else {
            node.getParent().insert(newNode);
        }
        this.setTById(newUnit.getId(), newUnit);
    }

    create(node) {
        const newUnit = new T({
            id: uuid(),
            name: 'New node',
        });
        const newNode = new Node(newUnit);
        node.insert(newNode);
        this.setTById(newUnit.getId(), newUnit);
    }

    delete(node) {
        window.tPool.delete(node.getDataUnit().getId());
        window.nodesPool.delete(node.getDomId());
        node.getT().removeFromDom();
    }

    async save() {

        const getNodesData = (node) => {

            const r = [];

            for (let nodeDom of node.getNodes().getDOM().children) {

                const nodeObject = window.nodesPool.get(nodeDom.getAttribute('id'));
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

        /*for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].name === 'main') {
                console.log(nodes[i]);
                break;
            }
        }*/
       // await new HttpClient().post('/nodes', {nodes})
    }
}