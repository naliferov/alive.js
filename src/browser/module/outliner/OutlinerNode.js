import {uuid} from "../../../F.js";
import V from "../../../type/V.js";

export default class OutlinerNode {

    contextNode;

    v;
    dataV;

    openClose;

    constructor(node) {

        this.contextNode = node;

        this.domId = uuid();
        window.outlinerNodesPool.set(this.domId, this);
        this.v = new V({id: this.domId, class: ['node']});

        const container = new V({class: ['nodeContainer', 'flex']});
        e('>', [container, this.v]);

        this.dataV = new V({class: ['dataUnit']});
        this.dataV.setAttr('outliner_node_id', this.domId);
        this.dataV.toggleEdit();
        e('>', [this.dataV, this.v]);

        this.openClose = new V({name: '>', class: ['openClose']});
        this.openClose.on('click', () => {
            if (this.openClose.hasClass('disabled')) return;
            if (this.nodes.isHidden()) this.nodes.show();
            else this.nodes.hide();
        });
        e('>', [this.openClose, container]);

        this.nodes = new V({class: ['subNodes']});
        e('>', [this.nodes, this.v]);

        const subNodes = this.contextNode.get('nodes');
        this.openClose.addClass('disabled');
        if (subNodes && subNodes.length) {
             this.openClose.removeClass('disabled');
        }
    }

    getDomId() { return this.domId; }

    isEmpty() { return !this.nodes.getDOM().children.length; }

    insertBefore(node) {
        //t.getDOM().parentNode.insertBefore(this.v.getDOM(), node.getDOM())
    }

    getParent() {
        return window.outlinerNodesPool.get(this.v.parentNode.parentNode.id);
    }

    next() {
        const next = this.v.getDOM().nextSibling;
        if (!next) return;
        return window.outlinerNodesPool.get(next.id);
    }

    prev() {
        const previous = this.v.getDOM().previousSibling;
        if (!previous) return;
        return window.outlinerNodesPool.get(previous.id);
    }
    getContextNode() { return this.contextNode }
    getV() { return this.v }
    getNodesV() { return this.v }
}