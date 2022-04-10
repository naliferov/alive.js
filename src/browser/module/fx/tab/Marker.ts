import List from "../../../core/List";
import BaseChunk from "./chunks/BaseChunk";
import U from "../../../core/U";

export default class Marker {

    monitor: U;
    markedChunks: List;
    direction: string = null;

    constructor(monitor: U) {
        this.markedChunks = new List();
        this.monitor = monitor;
    }

    getMarkedChunksIds() {
        const ids = [];
        this.markedChunks.iterate((chunk) => ids.push(chunk.getId()));
        return ids;
    }

    mark(chunk: BaseChunk) {
        chunk.mark();
        this.markedChunks.add(chunk);
        this.monitor.setTxt(chunk.getName());
    }

    unmark(chunk: BaseChunk) {
        chunk.unmark();
        //todo тут удаление происходит в зависимости от дирекшена
        //todo также для точного удаления можно взять индекс по порядку dom.
        this.markedChunks.delLast();
        this.monitor.setTxt('markerMonitor');
    }
    unmarkAll() {
        this.markedChunks.iterate((chunk) => chunk.unmark());
        this.markedChunks.reset();
        this.monitor.setTxt('markerMonitor');
        return this;
    }
    iterate(callback) { this.markedChunks.iterate(callback); }
    setDirection(direction: string) { this.direction = direction; }
    getDirection() { return this.direction; }
    delLast() { this.markedChunks.delLast(); }
    getFirst() { return this.markedChunks.getFirst(); }
    getLast() { return this.markedChunks.getLast(); }
    getLength() { return this.markedChunks.getLength(); }
    isEmpty() { return this.markedChunks.isEmpty(); }
    reset() { this.markedChunks.reset(); }
}