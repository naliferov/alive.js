export default class Node {
    data;

    constructor(data = {}) { this.data = data; }
    getData() { return this.data; }
    getId() { return this.data.id; }
    get(k) { return this.data[k]; }
    set(k, v) { this.data[k] = v; }
}