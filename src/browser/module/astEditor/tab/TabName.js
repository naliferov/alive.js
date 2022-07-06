import V from "../../../../type/V.js";

export default class TabName {

    v;

    name;
    closeBtn;

    contextNodeId;

    constructor(name, contextNode) {
        this.v = new V({class: 'tab'});

        this.name = new V({class: 'tabName', txt: name});
        e('>', [this.name, this.v]);

        this.closeBtn = new V({class: 'tabCloseBtn', txt: 'x'});
        e('>', [this.closeBtn, this.v]);

        this.contextNodeId = contextNode.get('id');
    }

    getContextNodeId() { return this.contextNodeId; }
    activate() { this.v.addClass('active'); }
    deactivate() { this.v.removeClass('active'); }
    onTabClick(fn) { this.v.on('click', (e) => fn(e)); }
    onTabCloseClick(fn) { this.closeBtn.on('click', (e) => fn(e)); }
    close() { this.v.removeFromDom(); }
    getV() { return this.v; }
}