import Id from "./nodes/id/Id.js";

export default class AstRunner {

    createModuleImports(imports, spacesCount) {

        let s = ''.padStart(spacesCount, ' ');
        let s2 = ''.padStart(spacesCount * 2, ' ');

        let js = s + 'return {\n';
        for (let i = 0; i < imports.length; i++) {
            const {name, path} = imports[i];
            js += s2 + `${name}: await import(${path}).default\n`;
        }
        js += s + '}';
        return js;
    }

    createJavascriptFromList(body, spaceCounts, addInitialSpace = true) {

        let s = '';

        let addSpace = addInitialSpace;
        let sp = () => {
            if (addSpace) {
                addSpace = false;
                return ''.padStart(spaceCounts, ' ');
            } else {
                return ''
            }
        }

        for (let i = 0; i < body.length; i++) {

            const d = body[i];
            if (d.t === 'Id') {
                let key = '';
                if (d.mode === 'let') key = 'let ';
                if (d.mode === 'new') key = 'new ';
                s += sp() + key + d.name;
            }
            else if (d.t === 'Op') s += sp() + ' ' + d.op + ' ';
            else if (d.t === 'Literal') s += sp() + d.txt;
            else if (d.t === 'NewLine') {
                s += sp() + '\n';
                addSpace = true;
            } else if (d.t === 'SubId') {
                const container = d.container;
                s += '.' + this.createJavascriptFromList(container, spaceCounts, false);
            } else if (d.t === 'Call') {
              s += '()';
            }
            else {
                console.log('Unknown astNode type', d);
            }
        }

        return s;
    }

    createJavascriptCodeForFile(AST) {

        console.log(AST);

        const js = [];
        js.push('let x = {}');
        js.push("x['main.imports'] = async () => {");

        js.push(this.createModuleImports(AST.imports, 4));

        js.push("}");
        js.push("x['main'] = async () => {");

        js.push(this.createJavascriptFromList(AST.body, 4));

        js.push("}");

        return js;
    }

    run(node, AST) {

        const js = this.createJavascriptCodeForFile(AST);

        //console.log('build javascript AST from AST and execute it', node, AST);
        console.log(js.join('\n'));

        e('processRun', {js});
    }
}