import U from "../../../../../../core/U";

export default class TabName {

    unit: U;

    nameUnit: U;
    closeBtn: U;

    constructor(tabId: string, name: string) {

        this.unit = new U({class: ['flex', 'tabHeader']});
        this.unit.setAttr('tid', tabId);

        this.nameUnit = new U({class: [], txt: name});
        this.unit.insert(this.nameUnit);

        this.closeBtn = new U({class: ['tabClose'], txt: '×'});
        this.unit.insert(this.closeBtn);
    }

    getName() {
        return this.nameUnit.getText();
    }

    markActive() {
        this.unit.addClass('active');
    }

    markInactive() {
        this.unit.removeClass('active');
    }

    click(handler) { this.unit.on('click', handler); }

    clickOnClose(handler) {
        this.closeBtn.on('click', (e) => {
            e.stopPropagation(); handler(e);
        });
    }

    remove() {
        this.unit.removeFromDom();
    }

    getUnit() {
        return this.unit;
    }
}