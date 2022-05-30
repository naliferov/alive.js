import T from "../../../type/T";
import {uuid} from "../../../F";

export default class Node {

    domId;
    dataUnit;

    nodes;

    unit;
    openClose;

    constructor(unit) {

        this.domId = uuid();
        window.nodesPool.set(this.domId, this);

        this.unit = new T({id: this.domId, class: ['node']});

        this.dataUnit = unit;
        this.dataUnit.setAttr('nid', this.domId);
        this.dataUnit.addClass('dataUnit');

        const container = new T({class: ['nodeContainer', 'flex']});
        this.unit.insert(container);

        this.openClose = new T({name: '>', class: ['openClose']});
        this.openClose.on('click', async () => {
            if (this.openClose.hasClass('disabled')) return;
            if (this.nodes.isHidden()) this.nodes.show();
            else this.nodes.hide();
        });

        container.insert(this.openClose);
        container.insert(this.dataUnit);
        this.dataUnit.toggleEdit();
        this.nodes = new T({class: ['subFields']});
        this.unit.insert(this.nodes);

        const subNodes = this.getDataUnit().getNodes();

        this.openClose.addClass('disabled')
        if (subNodes && subNodes.length) {
            this.openClose.removeClass('disabled');
        }
    }

    getDomId() { return this.domId; }

    isEmpty() { return !this.nodes.getDOM().children.length; }

    insertBefore(node) {
        const t = node.getT();
        t.getDOM().parentNode.insertBefore(this.getT().getDOM(), t.getDOM())
    }

    getParent() {
        return window.nodesPool.get(this.getT().getDOM().parentNode.parentNode.id);
    }

    next() {
        const next = this.unit.getDOM().nextSibling;
        if (!next) return;
        return window.nodesPool.get(next.id);
    }

    prev() {
        const previous = this.unit.getDOM().previousSibling;
        if (!previous) return;
        return window.nodesPool.get(previous.id);
    }

    insert(node) { this.nodes.insert(node.getUnit()) }
    getDataUnit() { return this.dataUnit }
    getContextT() { return this.dataUnit }
    getUnit() { return this.unit }
    getT() { return this.unit }
    getNodes() { return this.nodes }
}