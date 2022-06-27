import AstNode from "../../AstNode";
import NewLine from "../../NewLine";
import Space from "../../Space";
import BodyNode from "../BodyNode";

export default class IfBody extends BodyNode {

    constructor() {
        super('', {className: ['ifBody', 'shift']});
    }
}