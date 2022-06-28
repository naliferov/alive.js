import AstRuntime from "./module/astEditor/AstRuntime";
import E from "../io/E";
import Nodes from "./module/outliner/Nodes";
import Input from "./Input";
import {
    AST_CONTROL_MODE, OPEN_TAB,
    NODES_CONTROL,
    AST_NODE_EDIT_MODE
} from "../io/EConstants";
import TabManager from "./module/astEditor/tab/TabManager";
import LocalState from "./Localstate";
import HttpClient from "../io/http/HttpClient";
import Dom from "../type/Dom";
import {uuid} from "../F";

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
                if (window.eHandlers[args[0]]) window.eHandlers[args[0]](...args);
            },
            get(target, prop, receiver) { return 1; },
            set(target, k, v) {
                window.eHandlers[k] = v;
                return true;
            }
        });
        e['>'] = (_, one, two, index = null) => {

            if (index !== null) {
                 one.getDOM().insertBefore(one.getDOM(), two.getDOM().children[index]);
                 return;
            }
            two.getDOM().append(one.getDOM());
            return this;
        }
        const pageIDE = new Dom({class: ['pageIDE']});
        e('>', pageIDE, app);

        /**
         * inBr() {
         *         this.in(new Node({tagName: 'br'}));
         *         return this;
         *     }
         *     insertBefore(unit, beforeUnit) {
         *         this.getDOM().insertBefore(unit.getDOM(), beforeUnit.getDOM());
         *     }
         * @type {Nodes}
         */

        const nodes = new Nodes;
        await nodes.init();
        e('>', nodes.getDom(), app);
        return;

        const localState = new LocalState();

        const fxTabManager = new TabManager(pubsub, nodes, localState);
        const fxRuntime = new AstRuntime(pubsub, fxTabManager);
        fxRuntime.init(pageFx);

        const input = new Input(window);

        pubsub.sub(OPEN_TAB, ({unit}) => fxRuntime.openTab(unit));
        pubsub.sub(NODES_CONTROL, () => {
            input.onKeyDown(async (e) => await nodes.handleKeyDown(e));
            input.onKeyUp(async (e) => await nodes.handleKeyUp(e));
            input.onDblClick(async (e) => await nodes.handleClick(e));
        });
        pubsub.sub(AST_CONTROL_MODE, () => {
            input.onKeyDown(async (e) => await fxRuntime.onKeyDown(e));
        });
        pubsub.sub(AST_NODE_EDIT_MODE, () => {
            input.disableHandlers()
        });

        fxRuntime.onClick(() => pubsub.pub(AST_CONTROL_MODE));
        nodes.getUnit().on('click', () => pubsub.pub(NODES_CONTROL));

        pubsub.pub(AST_CONTROL_MODE);

        const activeTabId = localState.getActiveTabId();
        const openedFx = localState.getOpenedTabs();

        for (let fxId in openedFx) {
            const unit = await nodes.getTById(fxId);
            if (!unit) {
                localState.closeTab(fxId);
                continue;
            }
            await fxRuntime.openTab(unit);
        }
        if (activeTabId && window.nodesPool.get(activeTabId)) {
            const node = await nodes.getTById(activeTabId);
            await fxRuntime.focusTab(node);
        }
    }

    async run() {
        this.app = new Dom();
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
