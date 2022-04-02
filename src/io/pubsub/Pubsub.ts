export default class Pubsub {

    handlers = [];

    pub(name: string, data: {} = null) {
        if (this.handlers[name]) this.handlers[name](data);
    }
    sub(name: string, callback) {
        this.handlers[name] = callback;
    }
}