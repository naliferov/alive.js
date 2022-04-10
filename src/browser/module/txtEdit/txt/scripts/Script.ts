import U from "../../../../core/U";

export default class Script {

    contextUnit: U;

    unit: U;
    scriptName: U;

    copyBtn: U;
    editBtn: U;
    deleteBtn: U;

    constructor(contentUnit: U) {
        this.contextUnit = contentUnit;

        this.unit = new U({class: ['scriptRow', 'flex']});

        this.copyBtn = new U({txt: 'copy', class: ['btn']});
        this.unit.insert(this.copyBtn);
        this.editBtn = new U({txt: 'edit', class: ['btn']});
        this.unit.insert(this.editBtn);
        this.deleteBtn = new U({txt: 'delete', class: ['btn']});
        this.unit.insert(this.deleteBtn);

        this.scriptName = new U({txt: contentUnit.getName(), style: {'margin-left': '10px'}});
        this.unit.insert(this.scriptName);
    }

    enableNameEdit(finishEditCallback) {
        this.scriptName.removeFromDom();
        this.scriptName = new U({tagName: 'input', value: this.contextUnit.getName(), style: {'margin-left': '10px'}});
        this.unit.insert(this.scriptName);
        this.scriptName.focus();

        this.scriptName.on('keypress',async (e) => {
            if (e.key !== 'Enter') return;
            await finishEditCallback(this.scriptName.getValue());
            this.disableNameEdit();
        });
    }

    disableNameEdit() {
        this.scriptName.removeFromDom();
        this.scriptName = new U({txt: this.contextUnit.getName(), style: {'margin-left': '10px'}});
        this.unit.insert(this.scriptName);
    }

    click(handler) {
        this.unit.on('click', handler);
    }

    clickCopy(handler) {
        this.copyBtn.on('click', handler);
    }

    clickEdit(handler) {
        this.editBtn.on('click', handler);
    }

    clickDelete(handler) {
        this.deleteBtn.on('click', handler);
    }

    getContextUnit() {
        return this.contextUnit;
    }

    getUnit() {
        return this.unit;
    }
}