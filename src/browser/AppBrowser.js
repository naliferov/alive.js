import T from "../type/T";
import FxRuntime from "./module/astEditor/FxRuntime";
import Pubsub from "../io/pubsub/Pubsub";
import Nodes from "./module/nodes/Nodes";
import Input from "./Input";
import {
    AST_CONTROL_MODE, OPEN_TAB,
    NODES_CONTROL,
    AST_NODE_EDIT_MODE
} from "../io/pubsub/PubsubConstants";
import TabManager from "./module/astEditor/tab/TabManager";
import LocalState from "./Localstate";
import HttpClient from "../io/http/HttpClient";

class AppBrowser {

    app;
    input;

    async showSignPage(app, type) {

        const isSignIn = type === 'sign_in';
        const formName = isSignIn ? 'Sign in': 'Sign up';

        const pageSign = new T({class: ['pageSign']});
        app.in(pageSign);

        const signContainer = new T({class: ['signContainer']});
        pageSign.in(signContainer);

        const sign = new T({class: ['signBlock']});
        signContainer.in(sign);

        sign.in(new T({txt: formName})).inBr();

        sign.in(new T({name: 'Email'}));
        const email = new T({tagName: 'input', class: ['emailInput']});
        sign.in(email).inBr();

        sign.in(new T({name: 'Password'}));
        const password = new T({tagName: 'input', class: ['emailInput']});
        password.setAttr('type', 'password');
        sign.in(password);

        sign.inBr().inBr();
        const btn = new T({tagName: 'button', name: formName})
        sign.in(btn);

        const submit = async () => {
            const data = {email: email.getValue(), password: password.getValue()};
            const res = await new HttpClient().post(document.location.pathname, data);
            // @ts-ignore
            if (!res.err) {
                document.location.href = '/';
                return;
            }
            document.location.reload();
        };
        const inputProcess = async (e) => e.key === 'Enter' ? submit() : null;

        email.on('keydown', (e) => inputProcess(e));
        password.on('keydown', (e) => inputProcess(e));
        btn.on('click', async () => submit());

        if (isSignIn) {
            sign.inBr().inBr();
            sign.in(new T({tagName: 'span', name: "Don't have an account? "}));
            sign.in(new T({tagName: 'a', name: "Sign up"}).setAttr('href', '/sign/up'));
        }
    }

    async showFx(app) {

        window.tPool = new Map;
        window.nodesPool = new Map;
        window.astNodesPool = new Map;

        const pageFx = new T({class: ['pageFx']});
        app.in(pageFx);

        const pubsub = new Pubsub();
        const nodes = new Nodes(pubsub);
        await nodes.init(pageFx);
        const localState = new LocalState();

        const fxTabManager = new TabManager(pubsub, nodes, localState);
        const fxRuntime = new FxRuntime(nodes, pubsub, fxTabManager);
        fxRuntime.init(pageFx);

        const input = new Input(window);

        pubsub.sub(OPEN_TAB, ({unit}) => fxRuntime.openTab(unit));
        pubsub.sub(NODES_CONTROL, () => {
            input.onKeyDown(async (e) => await nodes.handleKeyDown(e));
            input.onKeyUp(async (e) => await nodes.handleKeyUp(e));
            input.onDblClick(async (e) => await nodes.handleClick(e));
        });
        pubsub.sub(AST_CONTROL_MODE, () => {
            console.log('ast control mode');
            input.onKeyDown(async (e) => await fxRuntime.onKeyDown(e));
        });
        pubsub.sub(AST_NODE_EDIT_MODE, () => {
            console.log('AST_NODE_EDIT_MODE');
            input.disableHandlers()
        });

        fxRuntime.onClick(() => pubsub.pub(AST_CONTROL_MODE));
        nodes.getUnit().on('click', () => pubsub.pub(NODES_CONTROL));

        pubsub.pub(AST_CONTROL_MODE);

        const openedFx = localState.getOpenedTabs();

        for (let fxId in openedFx) {
            const unit = await nodes.getTById(fxId);
            if (!unit) {
                localState.closeTab(fxId);
                continue;
            }
            await fxRuntime.openTab(unit);
        }

        const activeTabId = localState.getActiveTabId();
        if (activeTabId && window.tPool.get(activeTabId)) {
            const unit = await nodes.getTById(activeTabId);
            await fxRuntime.focusTab(unit);
        }
    }

    async run() {
        this.app = new T();
        this.app.setDOM(document.getElementById('app'));

        const path = document.location.pathname
        const m = {
            '/': () => this.showFx(this.app),
            '/sign/in': () => this.showSignPage(this.app, 'sign_in'),
            '/sign/up': () => this.showSignPage(this.app, 'sign_up'),
        }
        if (m[path]) m[path]();
    }
}

new AppBrowser().run();
