import AstNode from "../AstNode.js";
import ModuleImports from "./ModuleImports.js";
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
            imports: this.imports.serialize(),
            callableCondition: this.callableCondition.serialize(),
            body: this.body.serialize(),
        };
    }

    insert(chunk) { this.body.insert(chunk); }

    clear() {
        this.imports.clear();
        this.callableCondition.clear();
        this.body.clear();
    }
}