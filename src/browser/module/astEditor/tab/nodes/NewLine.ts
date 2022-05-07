import AstNode from "./AstNode";

export default class NewLine extends AstNode {

    constructor() {
        super('', {tagName: 'br', className: 'newLine'});
        this.newLine();
    }
}