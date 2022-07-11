import AstNode from "../AstNode.js";
import Keyword from "../Keyword.js";
import Space from "../Space.js";

export default class Import extends AstNode {

    constructor() {
        super('', {className: 'import'});

        super.insert(new Keyword('import'));

        this.importName = new AstNode('', {className: 'importName'});
        super.insert(this.importName);

        super.insert(new Space);
        super.insert(new Keyword('from'));

        this.importPath = new AstNode('', {className: 'importPath'});
        super.insert(this.importPath);
    }

    serialize() {
        const serialized = super.serialize();

        //todo maybe importModuleId, aka NodeId;
        serialized.importName = this.importName.getTxt();
        serialized.importPath = this.importName.getTxt();

        return serialized;
    }

    getImportName() {
        return this.importName;
    }
}

