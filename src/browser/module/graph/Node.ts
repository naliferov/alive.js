import T from "../../../T";

export default class Node {

    unit: T;
    dataUnit: T;

    fields: T;
    openClose: T;

    constructor(unit: T) {

        this.dataUnit = unit;
        this.dataUnit.addClass('dataUnit');

        this.unit = new T({class: ['mindField']});
        const flex = new T({class: ['mindFieldStructure', 'flex']});
        this.unit.insert(flex);

        this.openClose = new T({txt: '>', class: ['openClose']});
        this.openClose.on('click', async () => {
            if (this.openClose.hasClass('disabled')) {
                return
            }
            if (this.fields.isHidden()) {
                this.fields.show();
                this.dataUnit.setOpen();
            } else {
                this.fields.hide();
                this.dataUnit.setClose();
            }
        });

        this.openClose.addClass('disabled')
        flex.insert(this.openClose);

        flex.insert(unit);
        unit.toggleEdit();

        this.fields = new T({class: ['subFields']});
        if (!this.dataUnit.isOpen()) {
            this.fields.hide();
        }
        this.unit.insert(this.fields);

        const subUnits = this.getDataUnit().getUnits();
        if (subUnits && subUnits.length) {
            this.openClose.removeClass('disabled');
        }
    }

    markAsLink() {
        this.unit.addClass('link');
    }

    prevId(): string|undefined {
        // @ts-ignore
        return this.unit.getDOM().previousSibling ? this.unit.getDOM().previousSibling.id : null;
    }

    setIdToDom(id: string) {
        this.unit.setIdToDom(id);
    }

    setTxtToData(txt: string) {
        this.dataUnit.setTxtToData(txt);
    }

    getId(): string {
        return this.dataUnit.getId();
    }
    insert(mindField: Node) { this.fields.insert(mindField.getUnit()) }
    getDataUnit() { return this.dataUnit }
    getUnit() { return this.unit }
    getFields(): T { return this.fields }
}