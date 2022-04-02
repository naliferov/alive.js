import HttpClientB from "../../../../io/HttpClientB";
import U, {UnitData} from "../../../core/U";
import {SELECTOR_TOGGLE, SELECTOR_STATUS_CHANGE, MOVER_TOGGLE, MOVER_STATUS_CHANGE} from "./Action";
import {cloneObject, uuid} from "../../../../F";

export type UnitsType = Map<string, U>;

export default class State {

    units: UnitsType = new Map<string, U>();

    modifiers: {
        selector: boolean,
        mover: boolean
    } = {
        selector: false,
        mover: false
    }

    subscribers: [] = [];

    async dispatch(action: string, data: any = {}) {

        const map = {
            [SELECTOR_TOGGLE]: async d => this.dispatch(SELECTOR_STATUS_CHANGE, {status: !this.modifiers.selector })
        };

        if (map[action]) {
            await map[action](data);
        } else if (action === SELECTOR_STATUS_CHANGE) {
            this.modifiers.selector = data.status;
        } else if (action === MOVER_TOGGLE) {
            await this.dispatch(MOVER_STATUS_CHANGE, {status: !this.modifiers.mover });
        } else if (action === MOVER_STATUS_CHANGE) {
            this.modifiers.mover = data.status;
        } else if (action === MOVER_STATUS_CHANGE) {
            this.modifiers.mover = data.status;
        }

        await this.pub(action, data);
    }

    async pub(action: string, data: any = {}) {

        const actionSubscribers = this.subscribers[action];
        if (!actionSubscribers) {
            return;
        }
        for (let i = 0; i < actionSubscribers.length; i++) actionSubscribers[i](data);
    }

    sub(action: string, callback) {
        if (!this.subscribers[action]) {
            this.subscribers[action] = [];
        }
        this.subscribers[action].push(callback);
    }

    //createSelector
    select(path: string) {

    }

    setUnits(units: UnitsType) {
        this.units = units;
    }

    async save(data) {
        await new HttpClientB().post('/state', {data});
    }

    getUnit(id: string) {
        return this.units.get(id);
    }

    getUnitByName(name: string): U|undefined {
        for (const [_, unit] of this.units) {
            if (unit.getName() === name) return unit;
        }
    }

    getUnits() {
        return this.units;
    }

    async setUnit(unit: U) {
        this.units.set(unit.getId(), unit);
    }

    async deleteUnit(id: string) {
        this.units.delete(id);
    }

    //move this method to mindFields
    async copy(id: string) {
        const unit = this.getUnit(id);
        if (!unit) return;

        const newUnitData: UnitData = cloneObject(unit.getData());
        newUnitData.id = uuid();
        newUnitData.name = newUnitData.name + '_copy';

        const newUnit = new U(newUnitData);
        await this.setUnit(newUnit);

        return newUnit;
    }

    getUnitsByNames() {
        const unitNames = {};
        for (const [_, unit] of this.units) {
            unitNames[unit.getName()] = unit;
        }
        return unitNames;
    }
}