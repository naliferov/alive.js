import AstNode from "../AstNode";
import SubIdContainer from "./SubIdContainer";

export default class SubId extends AstNode {

    container;
    expressionMode = false;

    constructor() {
        super('', {className: 'subId'});

        const bracket = new AstNode('[', {className: 'bracket'});
        bracket.hide();

        super.insert(bracket);
        this.container = new SubIdContainer;
        super.insert(this.container);

        const bracket2 = new AstNode(']', {className: 'bracket'});
        bracket2.hide();

        super.insert(bracket2);
    }

    putSubId(node) {
        if (!this.subId) this.subId = node;
        super.insert(this.subId);
    }

    serialize() {
        let d = super.serialize();
        if (this.container) d.container = this.container.serializeSubChunks();
        return d;
    }

    switchMode() {

    }

    insert(chunk) { this.container.insert(chunk); }
}