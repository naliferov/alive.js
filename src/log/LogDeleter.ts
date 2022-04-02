export default class Logger {

    handler;
    prefix: string;

    constructor(prefix: string = '') { this.prefix = prefix; }

    setHandler(handler) { this.handler = handler; }

    log(msg: string, object?: object) {
        object ? console.log(this.prefix + msg, object) : console.log(this.prefix + msg);
    }

    info(msg: string, object: object = null) {
        this.log(msg, object);
    }

    warning(msg: string, object: object = null) {
        this.log(msg, object);
    }

    error(msg: string, object: object = null) {
        this.log(msg, object);
    }
}