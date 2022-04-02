import U from "../../U";

export default class Link {

    unit: U;

    constructor(name: string, href: string) {
        this.unit = new U({tagName: 'a', txt: name, class: ['link']});
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