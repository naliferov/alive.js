import U from "../../../../core/U";

export default class FxTabName {

    u: U;

    tabName: U;
    closeBtn: U;

    contextUnitId: string;

    constructor(txt: string, contextUnit: U) {
        this.u = new U({class: ['tab']});

        this.tabName = new U({class: ['tabName'], txt});
        this.u.in(this.tabName);

        this.closeBtn = new U({class: ['tabCloseBtn'], txt: 'x'});
        this.u.in(this.closeBtn);

        this.contextUnitId = contextUnit.getId();
    }

    getContextUnitId(): string {
        return this.contextUnitId;
    }

    activate() {
        this.u.addClass('active');
    }

    deactivate() {
        this.u.removeClass('active');
    }

    onTabClick(fn) {
        this.u.on('click', (e) => fn(e));
    }

    onTabCloseClick(fn) {
        this.closeBtn.on('click', (e) => fn(e));
    }

    close() {
        this.u.removeFromDom();
    }

    getUnit() {
        return this.u;
    }
}