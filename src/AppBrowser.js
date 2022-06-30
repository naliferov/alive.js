import AstRuntime from "./browser/module/astEditor/AstRuntime.js";
import Nodes from "./browser/module/outliner/Nodes.js";
import Input from "./browser/Input.js";
import {
    AST_CONTROL_MODE, OPEN_TAB,
    AST_NODE_EDIT_MODE, NODES_CONTROL_MODE
} from "./io/EConstants.js";
import TabManager from "./browser/module/astEditor/tab/TabManager.js";
import LocalState from "./browser/Localstate.js";
import HttpClient from "./io/http/HttpClient.js";
import V from "./type/V.js";

class AppBrowser {

    app;
    input;

    async showSignPage(app, type) {

        const isSignIn = type === 'sign_in';
        const formName = isSignIn ? 'Sign in': 'Sign up';

        const pageSign = new Nodes({class: ['pageSign']});
        app.in(pageSign);

        const signContainer = new Nodes({class: ['signContainer']});
        pageSign.in(signContainer);

        const sign = new Nodes({class: ['signBlock']});
        signContainer.in(sign);

        sign.in(new Nodes({txt: formName})).inBr();

        sign.in(new Nodes({name: 'Email'}));
        const email = new Nodes({tagName: 'input', class: ['emailInput']});
        sign.in(email).inBr();

        sign.in(new Nodes({name: 'Password'}));
        const password = new Nodes({tagName: 'input', class: ['emailInput']});
        password.setAttr('type', 'password');
        sign.in(password);

        sign.inBr().inBr();
        const btn = new Nodes({tagName: 'button', name: formName})
        sign.in(btn);

        const submit = async () => {
            const data = {email: email.getValue(), password: password.getValue()};
            const res = await new HttpClient().post(document.location.pathname, data);
            if (!res.err) {
                document.location.href = '/'; return;
            }
            document.location.reload();
        };
        const inputProcess = async (e) => e.key === 'Enter' ? submit() : null;

        email.on('keydown', (e) => inputProcess(e));
        password.on('keydown', (e) => inputProcess(e));
        btn.on('click', async () => submit());

        if (isSignIn) {
            sign.inBr().inBr();
            sign.in(new Nodes({tagName: 'span', name: "Don't have an account? "}));
            sign.in(new Nodes({tagName: 'a', name: "Sign up"}).setAttr('href', '/sign/up'));
        }
    }

    async showIDE(app) {

        window.domPool = new Map;
        window.nodesPool = new Map;
        window.outlinerNodesPool = new Map;
        window.astNodesPool = new Map;

        window.eHandlers = {};
        window.e = new Proxy(() => {}, {
            apply(target, thisArg, args) {
                const handler = args[0];
                const data = args[1];
                if (window.eHandlers[handler]) window.eHandlers[handler](data);
            },
            set(target, k, v) {
                window.eHandlers[k] = v;
                return true;
            }
        });
        e['>'] = (args) => {
            const [one, two, index] = args;

            if (index !== undefined) {
                 one.getDOM().insertBefore(one.getDOM(), two.getDOM().children[index]);
                 return;
            }
            two.getDOM().append(one.getDOM());
            return this;
        }

        const pageIDE = new V({class: ['pageIDE']});
        e('>', [pageIDE, app]);

        const nodes = new Nodes;
        await nodes.init();
        e('>', [nodes.getV(), pageIDE]);

        const localState = new LocalState();

        const tabManager = new TabManager(nodes, localState);
        const astRuntime = new AstRuntime(tabManager);
        astRuntime.init(pageIDE);
        e('>', [astRuntime.getV(), pageIDE]);

        const input = new Input(window);

        e[OPEN_TAB] = (unit) => astRuntime.openTab(unit);
        e[NODES_CONTROL_MODE] = () => {
            input.onKeyDown(async (e) => await nodes.handleKeyDown(e));
            input.onKeyUp(async (e) => await nodes.handleKeyUp(e));
            input.onDblClick(async (e) => await nodes.handleClick(e));
        };
        e[AST_CONTROL_MODE] = () => input.onKeyDown(async (e) => await astRuntime.onKeyDown(e));
        e[AST_NODE_EDIT_MODE] = () => input.disableHandlers();

        astRuntime.onClick(() => e(AST_CONTROL_MODE));
        nodes.getV().on('click', () => e(NODES_CONTROL_MODE));
        e(AST_CONTROL_MODE);


        const activeTabId = localState.getActiveTabId();
        const openedFx = localState.getOpenedTabs();

        console.log(activeTabId, openedFx);

        // for (let fxId in openedFx) {
        //     const unit = await nodes.getTById(fxId);
        //     if (!unit) {
        //         localState.closeTab(fxId);
        //         continue;
        //     }
        //     await fxRuntime.openTab(unit);
        // }
        // if (activeTabId && window.nodesPool.get(activeTabId)) {
        //     const node = await nodes.getTById(activeTabId);
        //     await fxRuntime.focusTab(node);
        // }
    }

    async run() {
        this.app = new V();
        this.app.setDOM(document.getElementById('app'));

        const path = document.location.pathname
        const m = {
            '/': () => this.showIDE(this.app),
            '/sign/in': () => this.showSignPage(this.app, 'sign_in'),
            '/sign/up': () => this.showSignPage(this.app, 'sign_up'),
        }
        if (m[path]) m[path]();
    }
}

new AppBrowser().run();
