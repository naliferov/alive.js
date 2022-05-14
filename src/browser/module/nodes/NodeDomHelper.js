export default class NodeDomHelper {

    static getFieldByDataUnit(dataUnit) {
        // @ts-ignore
        return dataUnit.parentNode.parentNode;
    }

    static getParentFieldByField(field) {
        // @ts-ignore
        return field.parentNode.parentNode;
    }

    static getSubfieldsByFied(field) {
        // @ts-ignore
        return field.children[1];
    }
}