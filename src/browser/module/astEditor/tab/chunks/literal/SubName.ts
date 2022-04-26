import BaseChunk from "../BaseChunk";

export default class SubName extends BaseChunk {

    subName: BaseChunk;

    constructor(name: string) {
        super('', {className: 'name'});
        //this.letChunk = new BaseChunk('let ', {className: 'keyword', hidden: true});
        //this.newChunk = new BaseChunk('new ', {className: 'keyword', hidden: true});
        //super.insert(this.letChunk);
        //super.insert(this.newChunk);

        //this.nameChunk = new BaseChunk(name, {className: 'namePart'});
        //super.insert(this.nameChunk);
    }

    serialize() {
        return {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            isLet: this.isLet(),
            isNew: this.isNew()
        }
    }

    getTxt(): string {
        return this.nameChunk.getTxt();
    }

    switchKeyword() {
        if (this.isLet()) {
            this.letChunk.hide();
            this.newChunk.show();
        } else if (this.isNew()) {
            this.letChunk.hide()
            this.newChunk.hide();
        } else {
            this.letChunk.show();
        }
    }

    isLet() {
        return this.letChunk.isShowed()
    }

    isNew() {
        return this.newChunk.isShowed()
    }

    enableLet() {
        this.letChunk.show();
    }

    enableNew() {
        this.newChunk.show();
    }

    toggleLetDisplay() {
        this.letChunk.toggleDisplay()
    }
}