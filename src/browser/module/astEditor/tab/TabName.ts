import T from "../../../../T";

export default class TabName {

    u: T;

    tabName: T;
    closeBtn: T;

    contextUnitId: string;

    constructor(txt: string, contextUnit: T) {
        this.u = new T({class: ['tab']});

        this.tabName = new T({class: ['tabName'], txt});
        this.u.in(this.tabName);

        this.closeBtn = new T({class: ['tabCloseBtn'], txt: 'x'});
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