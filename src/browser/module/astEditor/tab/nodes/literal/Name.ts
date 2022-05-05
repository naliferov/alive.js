import BaseNode from "../BaseNode";
import SubName from "./SubName";

export default class Name extends BaseNode {

    letChunk: BaseNode;
    newChunk: BaseNode;
    nameChunk: BaseNode;

    subNames: SubName[];

    constructor(name: string) {
        super('', {className: 'name'});
        this.letChunk = new BaseNode('let ', {className: 'keyword', hidden: true});
        this.newChunk = new BaseNode('new ', {className: 'keyword', hidden: true});
        super.insert(this.letChunk);
        super.insert(this.newChunk);

        this.nameChunk = new BaseNode(name, {className: 'namePart'});
        super.insert(this.nameChunk);
    }

    serialize() {
        return {
            t: this.constructor.name,
            name: this.nameChunk.getTxt(),
            mode: this.isLet() ? 'let' : this.isNew() ? 'new' : '',
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