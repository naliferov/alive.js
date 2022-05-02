import T from "../../../../T";
import Pubsub from "../../../../io/pubsub/Pubsub";

export default class Button {

    unit: T;

    txt: {
        active: string,
        inactive: string,
    } = {
        active: '',
        inactive: '',
    }

    constructor(txt: string, inactiveTxt: string = '') {
        this.unit = new T({txt: txt, class: ['btn', 'noselect']});
        this.txt.active = txt;
        this.txt.inactive = inactiveTxt;
    }

    getUnit() {
        return this.unit;
    }

    on(handlerType, callback) {
        this.unit.on(handlerType, callback);
    }

    click(cb) { this.unit.on('click', cb); }

    toggleStatus(status: boolean) {
        const isNeedChangeTxt = this.txt.inactive;

        if (status) {
            this.unit.addClass('active');
            if (isNeedChangeTxt) this.unit.setText(this.txt.inactive);
        } else {
            this.unit.removeClass('active');
            if (isNeedChangeTxt) this.unit.setText(this.txt.active);
        }
    }

    enable() {
        this.unit.addClass('active');
    }

    disable() {
        this.unit.removeClass('active');
    }
}