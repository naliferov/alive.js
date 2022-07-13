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

    createJavascriptFromList(body, spaceCounts) {
        for (let i = 0; i < body.length; i++) {

        }
    }

    createJavascriptCodeForFile(AST) {

        const js = [];
        js.push('let x = {}');

        js.push("x['main.imports'] = async () => {");

        js.push(this.createModuleImports(AST.imports, 4));

        js.push("}");
        js.push("x['main'] = async () => {");

        this.createJavascriptFromList(AST.body, 4);

        js.push("}");

        return js;
    }

    run(node, AST) {

        const js = this.createJavascriptCodeForFile(AST);

        console.log('build javascript AST from AST and execute it', node, AST);
        console.log(js.join('\n'));
    }
}