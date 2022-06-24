import AstNode from "./AstNode";

export default class NewLine extends AstNode {

    constructor() {
        super('', {className: 'newLine'});
        this.newLine();
    }

    isShifted() { return this.unit.hasClass('verticalShift'); }

    addVerticalShift() {
        this.unit.addClass('verticalShift');
    }

    removeVerticalShift() {
        this.unit.removeClass('verticalShift');
    }

    hasVerticalShift() {
        return this.unit.hasClass('verticalShift');
    }
}