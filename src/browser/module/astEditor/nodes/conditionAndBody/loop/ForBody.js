import BodyNode from "../BodyNode.js";

export default class ForBody extends BodyNode {
    constructor(txt = '', options = {}) {
        super('', {...options, className: ['forBody', 'shift']});
    }
}