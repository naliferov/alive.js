import T from "../../../../T";
import Pubsub from "../../../../io/pubsub/Pubsub";

export default class File {

    unit: T;

    constructor(text: string) {

        this.unit = new T({
            text: text
        });
    }

    getUnit() {
        return this.unit;
    }

    on(handlerType, callback) {
        this.unit.on(handlerType, callback);
    }
}