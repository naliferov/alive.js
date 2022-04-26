import U from "../../core/U";

export default class Console {

    unit: U;

    constructor(limit: number) {
        this.unit = new U({class: ['console']});
        const header = new U({txt: '[console]'});
        this.unit.insert(header);
    }

    log(str: string) {
        this.unit.insert(new U({txt: str}));
    }

    getUnit() {
        return this.unit;
    }
}