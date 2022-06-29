import AstNode from "./AstNode.js";

export default class Space extends AstNode {

    constructor() {
        super(' ', {className: 'space'});
    }
}