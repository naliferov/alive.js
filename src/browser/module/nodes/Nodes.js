import T from "../../../type/T";
import {cloneObject, uuid} from "../../../F";
import Node from "./Node";
import {OPEN_TAB} from "../../../io/pubsub/PubsubConstants";
import HttpClient from "../../../io/http/HttpClient";

export default class Nodes {

    t;
    rootNode;
    pubsub;

    constructor(pubsub) { this.pubsub = pubsub; }
    getUnit() { return this.t; }

    async init(app) {

        this.t = new T({class: ['nodes']});
        app.insert(this.t);

        const unitsData = (await (new HttpClient).get('/nodes')).data;
        const rootNode = new Node( new T({class: ['root'], units: unitsData, open: true}) );
        this.t.insert(rootNode.getUnit());

        this.rootNode = rootNode;
        this.rootNode.getDataUnit().oEditMode();

        let allUnits = {};

        const accumulateUnits = (units) => {
            for (let i = 0; i < units.length; i++) {
                allUnits[units[i].id] = units[i];
                if (units[i].units) accumulateUnits(units[i].units)
            }
        }
        accumulateUnits(unitsData);

        const render = (parentField) => {

            const subUnits = parentField.getDataUnit().getUnits();
            if (!Array.isArray(subUnits)) return;

            for (let i = 0; i < subUnits.length; i++) {

                const unit = new T(subUnits[i]);
                const field = new Node(unit);

                parentField.insert(field);
                this.setTById(unit.getId(), unit);
                render(field);
            }
        }
        render(rootNode);
    }

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
            //await this.save();
            return;
        }
        if (k === 'Tab') {
            e.preventDefault();

            if (e.shiftKey) {
                const parentFieldDom = fieldDOM.parentNode.parentNode;
                const parentOfParent = parentFieldDom.parentNode;

                if (parentFieldDom.nextSibling) parentOfParent.insertBefore(fieldDOM, parentFieldDom.nextSibling);
                else parentOfParent.appendChild(fieldDOM);

                await this.save();
                return;
            }
            /*if (fieldDOM.previousSibling) {
                const subfields = MindfieldsDomHelper.getSubfieldsByFied(fieldDOM.previousSibling);
                subfields.append(fieldDOM);
                await this.save();
            }*/

            return;
        }
        if (ctrl && k === 'ArrowUp' && node.prev()) {
            node.insertBefore(node.prev());
            e.target.focus();
            await this.save();
        }
        if (ctrl && k === 'ArrowDown' && node.next()) {
            node.next().insertBefore(node);
            e.target.focus();
            await this.save();
        }
    }

    async handleKeyUp(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const ignoreKeys = ['Enter', 'Tab', 'Control', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (new Set(ignoreKeys).has(e.key)) return;

        const node = this.getNodeById(e.target.getAttribute('nid'));
        const unit = node.getT();
        unit.setTxtToData(e.target.innerText);

        if (e.target.innerText.length === 0) {

            const calcSubUnits = (units) => {
                let count = units.length;
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i];
                    count += unit.units ? calcSubUnits(unit.units) : 0;
                }
                return count;
            }
            const totalUnits = unit.getData().units ? calcSubUnits(unit.getData().units) : 0;
            if (unit.getData().units && totalUnits > 5) {
                if (confirm(`Really want to delete element with [${totalUnits}] units?`)) {
                    unit.removeFromDom();
                }
            } else unit.removeFromDom();
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
        newNode.setIdToDom(newUnit.getId());

        if (node.next()) {
            newNode.insertBefore(node.next());
        } else {
            node.getParent().insert(newNode);
        }
        this.setTById(newUnit.getId(), newUnit);
    }

    async save() {

        const getNodesData = (rootNode) => {

            const data = [];

            for (let nodeDom of rootNode.getNodes().getDOM().children) {

                const node = window.nodesPool.get(nodeDom.getAttribute('id'));
                const unitData = node.getDataUnit().getData();
                let tData = {
                    id: unitData.id,
                    fx: {
                        chunks: [], markedChunksIds: []
                    }
                };

                const subUnits = getNodesData(node);
                if (subUnits.length > 0) tData.units = subUnits;
                if (unitData.txt) tData.txt = unitData.txt;
                if (unitData.fx && unitData.fx.chunks) {
                    tData.fx = unitData.fx;
                }

                data.push(tData);
            }
            return data;
        }
        await new HttpClient().post('/nodes', {data: getNodesData(this.rootNode)})
    }
}