import AstNode from "../AstNode";

export default class Literal extends AstNode {

    type: string

    constructor(str: string, type: string) {

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

    serialize(): object {
        return {
            t: this.constructor.name,
            txt: this.getTxt(),
            type: this.type,
        }
    }
}