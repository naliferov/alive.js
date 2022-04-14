import BaseChunk from "../BaseChunk";

export default class Name extends BaseChunk {

    letChunk: BaseChunk;
    nameChunk: BaseChunk;

    constructor(name: string, letPart: boolean = false) {
        super('', {className: 'name'});
        this.letChunk = new BaseChunk('let ', {className: 'keyword', hidden: true});
        this.nameChunk = new BaseChunk(name, {className: 'namePart'});
        super.insert(this.letChunk);
        super.insert(this.nameChunk);
    }

    serialize() {
        return {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            isLet: this.isLet()
        }
    }

    getTxt(): string {
        return this.nameChunk.getTxt();
    }

    isLet() {
        return this.letChunk.isShowed()
    }

    enableLet() {
        this.letChunk.show();
    }

    toggleLetDisplay() {
        this.letChunk.toggleDisplay()
    }
}