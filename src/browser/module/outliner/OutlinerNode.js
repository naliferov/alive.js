import {uuid} from "../../../F";
import Dom from "../../../type/Dom";

export default class OutlinerNode {

    node;

    dom;
    openClose;

    constructor(node) {

        this.node = node;

        this.domId = uuid();
        window.outlinerNodesPool.set(this.domId, this);
        this.dom = new Dom({id: this.domId, class: ['node']});

        const container = new Dom({class: ['nodeContainer', 'flex']});
        e('>', container, this.dom);

        this.dataNode = new Dom({class: ['dataUnit']});
        this.dataNode.setAttr('nid', this.domId);
        this.dataNode.toggleEdit();
        e('>', this.dataNode, this.dom);

        this.openClose = new Dom({name: '>', class: ['openClose']});
        this.openClose.on('click', async () => {
            if (this.openClose.hasClass('disabled')) return;
            if (this.nodes.isHidden()) this.nodes.show();
            else this.nodes.hide();
        });
        e('>', this.openClose, container);

        this.nodes = new Dom({class: ['subNodes']});
        e('>', this.nodes, this.dom);

        const subNodes = this.node.get('nodes');
        this.openClose.addClass('disabled');
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
        return window.outlinerNodesPool.get(this.getT().getDOM().parentNode.parentNode.id);
    }

    next() {
        const next = this.dom.getDOM().nextSibling;
        if (!next) return;
        return window.outlinerNodesPool.get(next.id);
    }

    prev() {
        const previous = this.dom.getDOM().previousSibling;
        if (!previous) return;
        return window.outlinerNodesPool.get(previous.id);
    }

    insert(node) {

        this.nodes.insert(node.getUnit())
    }
    getDataUnit() { return this.dataNode }
    getContextT() { return this.dataNode }
    getDom() { return this.dom }
    getT() { return this.dom }
    getNodes() { return this.nodes }
}