import BaseNode from "../BaseNode";

export default class NameOfProp extends BaseNode {

    nameChunk: BaseNode;

    constructor(name: string) {
        super();

        const dotChunk = new BaseNode('.');
        this.insert(dotChunk);

        this.nameChunk = new BaseNode(name, {className: 'propName'});
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