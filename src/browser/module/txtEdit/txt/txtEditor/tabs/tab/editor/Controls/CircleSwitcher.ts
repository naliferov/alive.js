import U from "../../../../../../../../core/U";

export default class CircleSwitcher {

    unit: U;
    handler;

    constructor() {
        this.unit = new U({class: ['circleBlue', 'noselect']});

        this.unit.on('touchstart', (e) => {
            this.handler(1);
        });
        this.unit.on('touchend', (e) => {
            this.handler(0);
        });
    }

    setHandler(handler) {
        this.handler = handler;
    }

    getUnit() { return this.unit; }
}