import U from "../../core/U";

export default class Field {

    unit: U;
    dataUnit: U;

    fields: U;
    openClose: U;

    constructor(unit: U) {

        this.dataUnit = unit;
        this.dataUnit.addClass('dataUnit');

        this.unit = new U({class: ['mindField']});
        const flex = new U({class: ['mindFieldStructure', 'flex']});
        this.unit.insert(flex);

        this.openClose = new U({txt: '>', class: ['openClose']});
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

        this.fields = new U({class: ['subFields']});
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
    insert(mindField: Field) { this.fields.insert(mindField.getUnit()) }
    getDataUnit() { return this.dataUnit }
    getUnit() { return this.unit }
    getFields(): U { return this.fields }
}