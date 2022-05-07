import AstNode from "../AstNode";

export default class NameOfProp extends AstNode {

    nameChunk: AstNode;

    constructor(name: string) {
        super();

        const dotChunk = new AstNode('.');
        this.insert(dotChunk);

        this.nameChunk = new AstNode(name, {className: 'propName'});
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