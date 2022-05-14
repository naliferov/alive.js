import T from "../../../type/T";

export default class Console {

    unit: T;

    constructor(limit: number) {
        this.unit = new T({class: ['console']});
        const header = new T({txt: '[console]'});
        this.unit.insert(header);
    }

    log(str: string) {
        this.unit.insert(new T({txt: str}));
    }

    getUnit() {
        return this.unit;
    }
}