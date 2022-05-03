export default class NodeDomHelper {

    static getFieldByDataUnit(dataUnit: HTMLElement): HTMLElement|undefined {
        // @ts-ignore
        return dataUnit.parentNode.parentNode;
    }

    static getParentFieldByField(field: HTMLElement): HTMLElement|undefined {
        // @ts-ignore
        return field.parentNode.parentNode;
    }

    static getSubfieldsByFied(field: ChildNode): HTMLElement|undefined {
        // @ts-ignore
        return field.children[1];
    }
}