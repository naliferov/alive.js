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
        serialized.name = this.importName.getTxt();
        serialized.importName = this.importName.getTxt();
        serialized.path = this.importPath.getTxt();
        serialized.importPath = this.importPath.getTxt();

        return serialized;
    }

    insertInImportName(chunk) { this.importName.insert(chunk); }
    insertInImportPath(chunk) { this.importPath.insert(chunk); }

    getImportName() { return this.importName; }
    getImportPath() { return this.importPath; }
}

