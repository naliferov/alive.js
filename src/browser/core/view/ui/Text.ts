import U from "../../U";

export default class Text {

    unit: U;

    constructor(txt: string) {
        this.unit = new U({text: txt});
    }

    getDOM() {
        return this.unit.getDOM();
    }

    getUnit() {
        return this.unit;
    }
}