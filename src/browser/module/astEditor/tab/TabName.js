import Node from "../../../../type/Node";

export default class TabName {

    u;

    tabName;
    closeBtn;

    contextUnitId;

    constructor(name, contextUnit) {
        this.u = new Node({class: ['tab']});

        this.tabName = new Node({class: ['tabName'], name});
        this.u.in(this.tabName);

        this.closeBtn = new Node({class: ['tabCloseBtn'], name: 'x'});
        this.u.in(this.closeBtn);

        this.contextUnitId = contextUnit.getId();
    }

    getContextUnitId() {
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