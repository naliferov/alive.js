import T from "../../../../type/T";

export default class Link {

    unit: T;

    constructor(name: string, href: string) {
        this.unit = new T({tagName: 'a', txt: name, class: ['link']});
        this.unit.getDOM().setAttribute('href', href);
        //this.txt.inactive = inactiveTxt;
    }

    getUnit() {
        return this.unit;
    }

    enable() {
        this.unit.addClass('active');
    }

    disable() {
        this.unit.removeClass('active');
    }
}