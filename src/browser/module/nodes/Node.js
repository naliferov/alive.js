import T from "../../../type/T";
import {uuid} from "../../../F";

export default class Node {

    domId;
    dataUnit;

    unit;
    nodes;
    openClose;

    constructor(unit) {

        this.domId = uuid();
        window.nodesPool.set(this.domId, this);

        this.unit = new T({id: this.domId, class: ['node']});
        this.dataUnit = unit;
        this.dataUnit.setAttr('nid', this.domId);
        this.dataUnit.addClass('dataUnit');

        const flex = new T({class: ['nodeStructure', 'flex']});
        this.unit.insert(flex);

        this.openClose = new T({txt: '>', class: ['openClose']});
        this.openClose.on('click', async () => {
            if (this.openClose.hasClass('disabled')) {
                return
            }
            if (this.nodes.isHidden()) {
                this.nodes.show();
                this.dataUnit.setOpen();
            } else {
                this.nodes.hide();
                this.dataUnit.setClose();
            }
        });

        flex.insert(this.openClose);
        flex.insert(this.dataUnit);
        this.dataUnit.toggleEdit();

        this.nodes = new T({class: ['subFields']});
        if (!this.dataUnit.isOpen()) {
            this.nodes.hide();
        }
        this.unit.insert(this.nodes);

        const subUnits = this.getDataUnit().getUnits();

        this.openClose.addClass('disabled')
        if (subUnits && subUnits.length) {
            this.openClose.removeClass('disabled');
        }
    }

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
    setIdToDom(id) { this.unit.setIdToDom(id); }
    getDataUnit() { return this.dataUnit }
    getContextT() { return this.dataUnit }
    getUnit() { return this.unit }
    getT() { return this.unit }
    getNodes() { return this.nodes }

}