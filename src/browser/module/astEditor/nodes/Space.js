import AstNode from "./AstNode";

export default class Space extends AstNode {

    constructor() {
        super(' ', {className: 'space'});
    }
}