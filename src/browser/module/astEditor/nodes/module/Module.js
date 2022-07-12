import AstNode from "../AstNode.js";
import ModuleImports from "./import/ModuleImports.js";
import ModuleBody from "./ModuleBody.js";
import ModuleCallableCondition from "./ModuleCallableCondition.js";

export default class Module extends AstNode {

    constructor() {
        super('', {className: 'module'});

        this.imports = new ModuleImports;
        super.insert(this.imports);

        this.callableCondition = new ModuleCallableCondition();
        super.insert(this.callableCondition);

        this.body = new ModuleBody;
        super.insert(this.body);
    }

    serialize() {
        return {
            imports: this.imports.serializeSubNodes(),
            callableCondition: this.callableCondition.serialize(),
            body: this.body.serializeSubNodes(),
        };
    }

    insert(chunk) { this.body.insert(chunk); }

    getImports() { return this.imports; }
    getCallableCondition() { return this.callableCondition; }
    getBody() { return this.body; }

    clear() {
        this.imports.clear();
        this.callableCondition.clear();
        this.body.clear();
    }
}