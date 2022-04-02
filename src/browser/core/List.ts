export default class List {

    list = [];

    add(item, index = null) {

        if (index !== null) {
            if (typeof index !== 'number') throw Error(`Index type is [${typeof index}].`);
            this.list.splice(index, 0, item);

            return index;
        }

        this.list.push(item);

        return this.getLength() - 1;
    }
    del(index){ this.list.splice(index, 1) };
    delLast() { this.list.splice(this.getLastIndex(), 1) };

    get(index) {
        return this.list[index];
    }
    getAll() {
        return this.list;
    }
    getFirst() {
        return this.list[0];
    }
    getLast() {
        return this.list[ this.list.length - 1 ]
    }
    getLastIndex() {
        return this.list.length - 1;
    }
    getLength() {
        return this.list.length;
    }
    isEmpty() {
        return this.getLength() === 0;
    }

    iterate(callback) {
        for (let i = 0; i < this.list.length; i++) callback(this.list[i], i);
    }

    reset() { this.list = []; }
}