import BaseChunk from "./BaseChunk";

export default class NewLine extends BaseChunk {

    constructor() {
        super('', {tagName: 'br', className: 'newLine'});
        this.newLine();
    }
}