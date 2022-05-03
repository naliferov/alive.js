import State from "./state/State";
import T, {TDataSerialized, UnitData} from "../../../T";
import {cloneObject, uuid} from "../../../F";
import Node from "./Node";
import MindfieldsDomHelper from "./NodeDomHelper";
import Pubsub from "../../../io/pubsub/Pubsub";
import {FX_RUNTIME_OPEN_TAB} from "../../../io/pubsub/PubsubConstants";
import HttpClient from "../../../io/http/HttpClient";

export default class Nodes {

    t: T;
    rootNode: Node;

    state: State;
    pubsub: Pubsub;

    constructor(state: State, pubsub: Pubsub) {
        this.state = state;
        this.pubsub = pubsub;
    }
    getUnit() { return this.t; }

    async init(app: T) {

        this.t = new T({class: ['mindFields']});
        app.insert(this.t);

        const unitsData = (await (new HttpClient).get('/nodes')).data;
        const rootNode = new Node(new T({class: ['root'], units: unitsData, open: true}));
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

        const render = async (parentField: Node) => {

            const subUnits = parentField.getDataUnit().getUnits();
            if (!Array.isArray(subUnits)) return;

            for (let i = 0; i < subUnits.length; i++) {

                let unitData = subUnits[i];
                // @ts-ignore
                if (unitData.linkId) {
                    // @ts-ignore
                    const targetUnitData = allUnits[unitData.linkId];
                    // @ts-ignore
                    unitData = {...targetUnitData, ...{id: unitData.id, linkId: unitData.linkId}};
                }

                const unit = new T(unitData);
                const field = new Node(unit);
                field.setIdToDom(unit.getId());

                // @ts-ignore
                if (unitData.linkId) field.markAsLink();

                parentField.insert(field);
                await this.state.setUnit(unit);
                await render(field);
            }
        }
        await render(rootNode);
    }

    async handleKeyDown(e) {

        if (!e.target.classList.contains('dataUnit')) return;

        const fieldDOM = MindfieldsDomHelper.getFieldByDataUnit(e.target);
        const k = e.key;
        const ctrl = e.ctrlKey || e.metaKey;

        if (k === 'Enter') {
            e.preventDefault();
            ctrl ? await this.copyLink(e.target) : await this.copy(e.target);
            await this.save();
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
            if (fieldDOM.previousSibling) {
                const subfields = MindfieldsDomHelper.getSubfieldsByFied(fieldDOM.previousSibling);
                subfields.append(fieldDOM);
                await this.save();
            }

            return;
        }
        if (ctrl && k === 'ArrowUp' && fieldDOM.previousSibling) {
            fieldDOM.parentNode.insertBefore(fieldDOM, fieldDOM.previousSibling);
            e.target.focus();
            await this.save();
        }
        if (ctrl && k === 'ArrowDown' && fieldDOM.nextSibling) {
            fieldDOM.parentNode.insertBefore(fieldDOM.nextSibling, fieldDOM);
            await this.save();
        }
    }

    async handleKeyUp(e) {

        if (!e.target.classList.contains('dataUnit')) return;
        const ignoreKeys = ['Enter', 'Tab', 'Control', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        if (new Set(ignoreKeys).has(e.key)) return;

        const fieldDOM = MindfieldsDomHelper.getFieldByDataUnit(e.target);
        const unit = this.state.getUnit(fieldDOM.id);

        if (!unit.getData().linkId) {
            unit.setTxtToData(e.target.innerText);
        }

        if (e.target.innerText.length === 0) {

            const calcSubUnitsRecursive = (units) => {

                let count = units.length;
                for (let i = 0; i < units.length; i++) {
                    const unit = units[i];
                    count += unit.units ? calcSubUnitsRecursive(unit.units) : 0;
                }
                return count;
            }

            const totalUnits = unit.getData().units ? calcSubUnitsRecursive(unit.getData().units) : 0;
            if (unit.getData().units && totalUnits > 5) {
                if (confirm(`Really want to delete element with [${totalUnits}] units?`)) {
                    fieldDOM.parentNode.removeChild(fieldDOM);
                }
            } else {
                fieldDOM.parentNode.removeChild(fieldDOM);
            }
        }

        await this.save();
    }

    async handleClick(e) {

        if (e.target.classList.contains('dataUnit')) {
            const fieldDOM = MindfieldsDomHelper.getFieldByDataUnit(e.target);
            const unit = this.state.getUnit(fieldDOM.id);
            this.pubsub.pub(FX_RUNTIME_OPEN_TAB, {unit});
            return;
        }

        if (!e.target.classList.contains('openClose')) return;
        await this.save();
    }

    async copy(target) {

        const fieldDOM = MindfieldsDomHelper.getFieldByDataUnit(target);
        const unit = this.state.getUnit(fieldDOM.id);

        let newUnitData: UnitData = cloneObject(unit.getData());
        newUnitData.id = uuid();
        delete newUnitData.units;

        //todo duplication code below
        const newUnit = new T(newUnitData);
        const newField = new Node(newUnit);
        newField.setIdToDom(newUnit.getId());

        if (fieldDOM.nextSibling) {
            fieldDOM.parentNode.insertBefore(newField.getUnit().getDOM(), fieldDOM.nextSibling)
        } else {
            fieldDOM.parentNode.append(newField.getUnit().getDOM())
        }

        await this.state.setUnit(newUnit);
    }

    async copyLink(target) {

        const fieldDOM = MindfieldsDomHelper.getFieldByDataUnit(target);

        let newUnitData: UnitData = {txt: target.innerText};
        newUnitData.id = uuid();
        newUnitData.linkId = fieldDOM.id;

        const newUnit = new T(newUnitData);
        const newField = new Node(newUnit);
        newField.setIdToDom(newUnit.getId());

        if (fieldDOM.nextSibling) {
            fieldDOM.parentNode.insertBefore(newField.getUnit().getDOM(), fieldDOM.nextSibling)
        } else {
            fieldDOM.parentNode.append(newField.getUnit().getDOM())
        }

        await this.state.setUnit(newUnit);
    }

    getIdsOfMindFieldsInHierarchyOrder() {

        const getIds = (fieldsDOM) => {
            const data = [];

            for (let item of fieldsDOM) {
                const subIds = getIds(item.children[1].children);
                data.push({
                    id: item.id,
                    subIds: subIds.length > 0 ? subIds : []
                });
            }
            return data;
        }

        return getIds(this.rootNode.getFields().getDOM().children);
    }

    async getById(id: string): Promise<T> {
        return this.state.getUnit(id);
    }

    async save() {

        const getUnitsData = (unitsIds) => {
            const data = [];

            for (let unitId of unitsIds) {

                const unitData = this.state.getUnit(unitId.id).getData();
                let tData: TDataSerialized = {
                    id: unitData.id,
                    fx: {
                        chunks: [],
                        markedChunksIds: []
                    }
                };

                if (unitData.linkId) {
                    tData.linkId = unitData.linkId;
                } else {
                    const subIds = getUnitsData(unitId.subIds);
                    if (subIds.length > 0) tData.units = subIds;
                    if (unitData.txt) tData.txt = unitData.txt;
                    if (unitData.open) tData.open = true;

                    // @ts-ignore
                    if (unitData.fx && unitData.fx.chunks) {
                        // @ts-ignore
                        tData.fx = unitData.fx;
                    }
                }

                data.push(tData);
            }

            return data;
        };

        const unitsIds = this.getIdsOfMindFieldsInHierarchyOrder();
        const unitsData = getUnitsData(unitsIds);
        await this.state.save(unitsData);
    }
}