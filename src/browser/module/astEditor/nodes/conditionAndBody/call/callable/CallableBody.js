import BodyNode from "../../BodyNode.js";

export default class CallableBody extends BodyNode {

    constructor(txt = '', options = {}) {
        super('', {...options, className: ['callableBody', 'shift']});
    }
}