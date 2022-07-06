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

    initGlobals() {
        window.domPool = new Map;
        window.nodesPool = new Map;
        window.outlinerNodesPool = new Map;
        window.astPool = new Map;

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
            let [v1, v2, index] = args;

            if (!(v1 instanceof V)) v1 = v1.getV();
            if (!(v2 instanceof V)) v2 = v2.getV();

            if (index !== undefined) {
                v2.getDOM().insertBefore(v1.getDOM(), v2.getDOM().children[index]);
                return;
            }
            v2.getDOM().append(v1.getDOM());
        }
        e['>after'] = (args) => {
            const [domA, domB] = args;
            domB.getDOM().after(domA.getDOM())
        }
    }

    async showSignPage(app, type) {

        this.initGlobals();

        const isSignIn = type === 'sign_in';
        const formName = isSignIn ? 'Sign in': 'Sign up';

        const pageSign = new V({class: 'pageSign'});
        e('>', [pageSign, app]);

        const signContainer = new V({class: 'signContainer'});
        e('>', [signContainer, pageSign]);

        const sign = new V({class: 'signBlock'});
        e('>', [sign, signContainer]);

        e('>', [new V({txt: formName}), sign]);
        e('>', [new V({name: 'Email'}), sign]);

        const email = new V({tagName: 'input', class: 'emailInput'});
        e('>', [email, sign]);

        e('>', [new V({name: 'Password'}), sign]);

        const password = new V({tagName: 'input', class: ['emailInput']});
        password.setAttr('type', 'password');
        e('>', [password, sign]);

        const btn = new V({tagName: 'button', txt: formName});
        e('>', [btn, sign]);

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
            e('>', [new V({tagName: 'span', txt: "Don't have an account? "}), sign]);
            e('>', [new V({tagName: 'a', txt: "Sign up"}).setAttr('href', '/sign/up'), sign]);
        }
    }

    async showIDE(app) {
        this.initGlobals();

        const pageIDE = new V({class: ['pageIDE']});
        e('>', [pageIDE, app]);

        const nodes = new Nodes;
        await nodes.init();
        e('>', [nodes.getV(), pageIDE]);

        const localState = new LocalState();

        const astContainer = new V({class: 'astContainer'});
        const tabManager = new TabManager(nodes, localState);
        e('>', [tabManager.getV(), pageIDE]);

        const input = new Input(window);

        e[OPEN_TAB] = ({node}) => tabManager.openTab(node);
        e[NODES_CONTROL_MODE] = () => {
            input.onKeyDown(async (e) => await nodes.handleKeyDown(e));
            input.onKeyUp(async (e) => await nodes.handleKeyUp(e));
            input.onDblClick(async (e) => await nodes.handleDblClick(e));
        };
        e[AST_CONTROL_MODE] = () => input.onKeyDown(async (e) => await tabManager.onKeyDown(e));
        e[AST_NODE_EDIT_MODE] = () => input.disableHandlers();

        astContainer.on('click', () => e(AST_CONTROL_MODE));
        nodes.getV().on('click', () => e(NODES_CONTROL_MODE));
        e(AST_CONTROL_MODE);


        const activeTabId = localState.getActiveTabId();
        const openedFx = localState.getOpenedTabs();


        for (let nodeId in openedFx) {
            const node = await nodes.getNodeById(nodeId);
            if (!node) {
                localState.closeTab(nodeId);
                continue;
            }
            await tabManager.openTab(node);
        }

        if (activeTabId && window.nodesPool.get(activeTabId)) {
            const node = await nodes.getNodeById(activeTabId);
            await tabManager.focusTab(node);
        }
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
