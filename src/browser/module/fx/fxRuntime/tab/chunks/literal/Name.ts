import BaseChunk from "../BaseChunk";

export default class Name extends BaseChunk {

    letChunk: BaseChunk;
    nameChunk: BaseChunk;

    constructor(name: string, letPart: boolean = false) {
        super('', {className: 'name'});
        this.letChunk = new BaseChunk('let ', {className: 'keyword', hidden: true});
        this.nameChunk = new BaseChunk(name, {className: 'name'});
        super.insert(this.letChunk);
        super.insert(this.nameChunk);
    }

    serialize() {
        return {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            isLet: this.letChunk.isShowed()
        }
    }

    toggleEditTxt() {
        this.nameChunk.toggleEditTxt();
    }

    toggleLetDisplay() {
        this.letChunk.toggleDisplay()
    }
}