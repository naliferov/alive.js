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
        window.outlinerPool.set(this.domId, this);
        this.v = new V({id: this.domId, class: ['node']});

        const container = new V({class: ['nodeContainer', 'flex']});
        e('>', [container, this.v]);

        this.openClose = new V({txt: '>', class: 'openClose'});
        this.openClose.on('click', () => {
            if (this.openClose.hasClass('disabled')) return;
            if (this.nodesV.isHidden()) this.nodesV.show();
            else this.nodesV.hide();
        });
        e('>', [this.openClose, container]);

        this.dataV = new V({class: 'dataUnit', txt: node.get('name')});
        this.dataV.setAttr('outliner_node_id', this.domId);
        this.dataV.toggleEdit();
        e('>', [this.dataV, container]);

        this.nodesV = new V({class: ['subNodes', 'shift']});
        e('>', [this.nodesV, this.v]);

        const subNodes = this.contextNode.get('nodes');
        this.openClose.addClass('disabled');
        if (subNodes && subNodes.length) {
             this.openClose.removeClass('disabled');
        }
    }

    getDomId() { return this.domId; }
    isEmpty() { return !this.nodesV.getDOM().children.length; }
    getParent() { return window.outlinerPool.get(this.v.parentDOM().parentNode.id); }

    next() {
        const next = this.v.getDOM().nextSibling;
        if (!next) return;
        return window.outlinerPool.get(next.id);
    }

    prev() {
        const previous = this.v.getDOM().previousSibling;
        if (!previous) return;
        return window.outlinerPool.get(previous.id);
    }
    getContextNode() { return this.contextNode }
    getV() { return this.v }
    getNodesV() { return this.nodesV}

    removeSubNodesShift() { this.nodesV.removeClass('shift'); }
}