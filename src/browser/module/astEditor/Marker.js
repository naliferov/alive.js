import List from "../../List.js";

export default class Marker {

    monitor;
    markedChunks;
    direction = null;

    constructor(monitor) {
        this.markedChunks = new List();
        this.monitor = monitor;
    }

    getMarkedChunksIds() {
        const ids = [];
        this.markedChunks.iterate((chunk) => ids.push(chunk.getId()));
        return ids;
    }

    mark(chunk) {
        chunk.mark();
        this.markedChunks.add(chunk);
        this.monitor.setTxt('Marked node: [' + chunk.getName() + ']', );
    }

    unmark(chunk) {
        chunk.unmark();
        //todo тут удаление происходит в зависимости от дирекшена
        //todo также для точного удаления можно взять индекс по порядку dom.
        this.markedChunks.delLast();
        this.monitor.setTxt('Marked node: []');
    }
    unmarkAll() {
        this.markedChunks.iterate((chunk) => chunk.unmark());
        this.markedChunks.reset();
        this.monitor.setTxt('Marked node: []');
        return this;
    }
    iterate(callback) { this.markedChunks.iterate(callback); }
    setDirection(direction) { this.direction = direction; }
    getDirection() { return this.direction; }
    delLast() { this.markedChunks.delLast(); }
    getFirst() { return this.markedChunks.getFirst(); }
    getLast() { return this.markedChunks.getLast(); }
    getLength() { return this.markedChunks.getLength(); }
    isEmpty() { return this.markedChunks.isEmpty(); }
    reset() { this.markedChunks.reset(); }
}