import BodyNode from "../BodyNode.js";

export default class IfBody extends BodyNode {

    constructor(txt = '', options = {}) {
        super('', {...options, className: ['ifBody', 'shift']});
    }
}