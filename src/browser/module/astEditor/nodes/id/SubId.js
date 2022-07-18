import AstNode from "../AstNode.js";
import SubIdContainer from "./SubIdContainer.js";

export default class SubId extends AstNode {

    container;
    expressionMode = false;

    constructor(txt = '', options = {}) {
        super('', {...options, className: 'subId'});

        const bracket = new AstNode('[', {className: 'bracket'});
        if (!this.expressionMode) bracket.hide();
        super.insert(bracket);

        const dot = new AstNode('.', 'className', 'dot');
        if (this.expressionMode) dot.hide();
        super.insert(dot);

        this.container = new SubIdContainer;
        super.insert(this.container);

        const bracket2 = new AstNode(']', {className: 'bracket'});
        if (!this.expressionMode) bracket2.hide();
        super.insert(bracket2);
    }

    putSubId(node) {
        if (!this.subId) this.subId = node;
        super.insert(this.subId);
    }

    getFirstContainerNode() {
        return this.container.getFirstChunk();
    }

    serialize() {
        let d = super.serialize();
        if (this.container) d.container = this.container.serializeSubNodes();
        return d;
    }

    switchMode() {

    }

    insert(chunk) { this.container.insert(chunk); }
}