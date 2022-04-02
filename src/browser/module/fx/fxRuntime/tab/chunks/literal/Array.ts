import BaseChunk from "../BaseChunk";

export default class Array extends BaseChunk {

    letChunk: BaseChunk;
    nameChunk: BaseChunk;

    constructor(name: string) {
        super('', {className: 'name'});
        this.letChunk = new BaseChunk('let ', {className: 'keyword', hidden: true});
        this.nameChunk = new BaseChunk(name, {className: 'name'});
        super.insert(this.letChunk);
        super.insert(this.nameChunk);
    }

    toggleEditTxt() {
        this.nameChunk.toggleEditTxt();
    }

    toggleLetDisplay() {
        this.letChunk.toggleDisplay()
    }
}