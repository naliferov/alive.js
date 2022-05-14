import T from "../../../../type/T";

export default class Text {

    unit: T;

    constructor(txt: string) {
        this.unit = new T({text: txt});
    }

    getDOM() {
        return this.unit.getDOM();
    }

    getUnit() {
        return this.unit;
    }
}