import AstNode from "./AstNode";

export default class NewLine extends AstNode {

    constructor() {
        super('', {className: 'newLine'});
        this.newLine();
    }

    addVerticalShift() {
        this.unit.addClass('verticalShift')
    }

    removeVerticalShift() {
        this.unit.removeClass('verticalShift')
    }
}