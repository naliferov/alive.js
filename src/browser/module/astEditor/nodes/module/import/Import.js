import AstNode from "../../AstNode.js";
import Keyword from "../../Keyword.js";
import Space from "../../Space.js";
import ImportName from "./ImportName.js";
import ImportPath from "./ImportPath.js";

export default class Import extends AstNode {

    constructor() {
        super('', {className: 'import'});

        super.insert(new Keyword('import'));

        this.importName = new ImportName;
        super.insert(this.importName);

        super.insert(new Space);
        super.insert(new Keyword('from'));

        this.importPath = new ImportPath;
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

