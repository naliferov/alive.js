export default class E {
    handlers = [];
    p(name, data= null) { if (this.handlers[name]) this.handlers[name](data); }
    s(name, callback) { this.handlers[name] = callback; }
}