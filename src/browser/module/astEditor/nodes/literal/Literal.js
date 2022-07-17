import AstNode from "../AstNode.js";

export default class Literal extends AstNode {

    type;

    constructor(str, type) {

        //todo Если убрать if и добавить отдельные классы, тогда markerMonitor будет показывать точный тип литерала исходя из более точного названия класса. (к примеру LiteralString. LiteralNumber)
        if (type === 'string') {
            super(str, {className: 'string'});
            this.type = 'string';
        } else if (type) {
            super(str, {className: 'number'});
            this.type = 'number';
        } else {
            throw `Invalid type: [${type}]`;
        }
    }

    iEditTxt() {
        super.iEditTxt();
        this.focus();
    }

    serialize() {
        return {
            ...super.serialize(),
            txt: this.getTxt(),
            type: this.type,
        }
    }
}