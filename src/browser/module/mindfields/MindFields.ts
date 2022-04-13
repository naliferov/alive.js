import State from "./state/State";
import U, {UnitData} from "../../core/U";
import {cloneObject, uuid} from "../../../F";
import MindField from "./MindField";
import MindfieldsDomHelper from "./MindfieldDomHelper";
import HttpClientB from "../../../io/http/client/HttpClientB";
import Pubsub from "../../../io/pubsub/Pubsub";
import {FX_RUNTIME_OPEN_TAB} from "../../../io/pubsub/PubsubConstants";

export default class MindFields {

    unit: U;
    rootMindField: MindField;

    state: State;
    pubsub: Pubsub;

    constructor(state: State, pubsub: Pubsub) {
        this.state = state;
        this.pubsub = pubsub;
    }

    getUnit() {
        return this.unit;
    }

    async init(app: U) {

        this.unit = new U({class: ['mindFields']});
        app.insert(this.unit);

        const unitsData = JSON.parse(await new HttpClientB().get('/state'));
        const rootMindField = new MindField(new U({class: ['root'], units: unitsData, open: true}));
        this.unit.insert(rootMindField.getUnit());
        this.rootMindField = rootMindField;
        this.rootMindField.getDataUnit().oEditMode();

        let allUnits = {};
        const accumulateUnits = (units) => {
            for (let i = 0; i < units.length; i++) {
                allUnits[units[i].id] = units[i];
                if (units[i].units) accumulateUnits(units[i].units)
            }
        }
        accumulateUnits(unitsData);

        const render = async (parentField: MindField) => {

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

                const unit = new U(unitData);
                const field = new MindField(unit);
                field.setIdToDom(unit.getId());

                // @ts-ignore
                if (unitData.linkId) {
                    field.markAsLink();
                }

                parentField.insert(field);
                await this.state.setUnit(unit);
                await render(field);
            }
        }
        await render(rootMindField);
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
        if (new Set(['Enter', 'Tab', 'Control', 'Meta']).has(e.key)) return;

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
            if (unit.getData().fx) {
                this.pubsub.pub(FX_RUNTIME_OPEN_TAB, {unit});
            }
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
        const newUnit = new U(newUnitData);
        const newField = new MindField(newUnit);
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

        const newUnit = new U(newUnitData);
        const newField = new MindField(newUnit);
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

        return getIds(this.rootMindField.getFields().getDOM().children);
    }

    async getById(id: string): Promise<U> {
        return this.state.getUnit(id);
    }

    async save() {

        const getUnitsData = (unitsIds) => {
            const data = [];

            for (let unitId of unitsIds) {

                const unitData = this.state.getUnit(unitId.id).getData();
                let dItem: {
                    id: string,
                    linkId?: string,
                    units?: any[],
                    txt?: string,
                    fx?: {}
                    open?: boolean,
                } = {id: unitData.id};

                if (unitData.linkId) {
                    dItem.linkId = unitData.linkId;
                } else {
                    const subIds = getUnitsData(unitId.subIds);
                    if (subIds.length > 0) dItem.units = subIds;
                    if (unitData.txt) dItem.txt = unitData.txt;
                    if (unitData.open) dItem.open = true;
                    if (unitData.fx) dItem.fx = unitData.fx;
                }

                data.push(dItem);
            }

            return data;
        };

        const unitsIds = this.getIdsOfMindFieldsInHierarchyOrder();
        const unitsData = getUnitsData(unitsIds);
        await this.state.save(unitsData);
    }
}