import T from "../../../../type/T";

export default class TabName {

    u: T;

    tabName: T;
    closeBtn: T;

    contextUnitId: string;

    constructor(name: string, contextUnit: T) {
        this.u = new T({class: ['tab']});

        this.tabName = new T({class: ['tabName'], name});
        this.u.in(this.tabName);

        this.closeBtn = new T({class: ['tabCloseBtn'], name: 'x'});
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