import U from "../../U";
import Pubsub from "../../../../io/pubsub/Pubsub";

export default class File {

    unit: U;

    constructor(text: string) {

        this.unit = new U({
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