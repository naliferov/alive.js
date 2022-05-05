import BaseNode from "./BaseNode";

export default class NewLine extends BaseNode {

    constructor() {
        super('', {tagName: 'br', className: 'newLine'});
        this.newLine();
    }
}