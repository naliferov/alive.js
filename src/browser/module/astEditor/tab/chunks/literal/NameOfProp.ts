import BaseChunk from "../BaseChunk";

export default class NameOfProp extends BaseChunk {

    nameChunk: BaseChunk;

    constructor(name: string) {
        super();

        const dotChunk = new BaseChunk('.');
        this.insert(dotChunk);

        this.nameChunk = new BaseChunk(name, {className: 'propName'});
        this.insert(this.nameChunk);
    }

    displayAsFunction() {
        this.nameChunk.getUnit().removeClass('propName');
        this.nameChunk.getUnit().addClass('function');
    }

    displayAsName() {
        this.nameChunk.getUnit().removeClass('function');
        this.nameChunk.getUnit().addClass('propName');
    }

    mark() { this.nameChunk.mark(); }
    unmark() { this.nameChunk.unmark(); }
}