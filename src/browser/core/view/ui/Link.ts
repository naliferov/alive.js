import Node from "../../../../type/Node";

export default class Link {

    unit: Node;

    constructor(name: string, href: string) {
        this.unit = new Node({tagName: 'a', txt: name, class: ['link']});
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