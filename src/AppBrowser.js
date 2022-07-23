import Nodes from "./browser/module/outliner/Nodes.js";
import Input from "./browser/Input.js";
import TabManager from "./browser/module/astEditor/tab/TabManager.js";
import LocalState from "./browser/Localstate.js";
import HttpClient from "./io/http/HttpClient.js";
import V from "./type/V.js";
import AstRunner from "./browser/module/astEditor/AstRunner.js";
import ModuleImports from "./browser/module/astEditor/nodes/module/ModuleImports.js";
import ModuleCallableCondition from "./browser/module/astEditor/nodes/module/ModuleCallableCondition.js";
import ModuleBody from "./browser/module/astEditor/nodes/module/ModuleBody.js";

class AppBrowser {

    app;
    input;

    initGlobals() {
        window.nodesPool = new Map;
        window.domPool = new Map;
        window.outlinerPool = new Map;
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
        e['>before'] = (args) => {
            const [domA, domB] = args;
            domB.getDOM().before(domA.getDOM())
        }
    }

    async showSignPage(app, type) {
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

    async showProcessPage(app) {
        const pageProcess = new V({class: ['page'], txt: 'process page'});
        e('>', [pageProcess, app]);
    }

    async showIDE(app) {
        const pageIDE = new V({class: ['pageIDE']});
        e('>', [pageIDE, app]);


        const sideBar = new V({class: 'sidebar'});
        e('>', [sideBar, pageIDE]);

        const btnsBar = new V({class: 'btnsBar'});
        e('>', [btnsBar, sideBar]);

        const addNodeBtn = new V({class: ['btn'], txt: '+'});
        e('>', [addNodeBtn, btnsBar]);

        const prev = new V({class: 'btn', txt: '<'});
        e('>', [prev, btnsBar]);
        prev.on('click', () => e('ASTPrevVersion'));

        const next = new V({class: 'btn', txt: '>'});
        e('>', [next, btnsBar]);
        next.on('click', () => e('ASTNextVersion'));

        const run = new V({class: 'btn', txt: 'run'});
        e('>', [run, btnsBar]);
        run.on('click', () => e('runASTModule'));

        const process = new V({class: 'btn', tagName: 'a', txt: 'process'});
        process.setAttr('href', '/process222');
        e('>', [process, btnsBar]);
        const AST = new V({class: 'btn', tagName: 'a', txt: 'AST'});
        AST.setAttr('href', '/');
        e('>', [AST, btnsBar]);

        const nodes = new Nodes;
        await nodes.init();
        e('>', [nodes.getV(), sideBar]);

        const localState = new LocalState();

        const tabManager = new TabManager(nodes, localState);
        e('>', [tabManager.getV(), pageIDE]);

        const input = new Input(window);

        e['openTab'] = ({node}) => tabManager.openTab(node);
        e['nodesControlMode'] = () => {
            input.onKeyDown(async (e) => await nodes.handleKeyDown(e));
            input.onKeyUp(async (e) => await nodes.handleKeyUp(e));
            input.onDblClick(async (e) => await nodes.handleDblClick(e));
        };
        e['astControlMode'] = () => input.onKeyDown(async (e) => await tabManager.onKeyDown(e));
        e['astNodeEditMode'] = () => input.disableHandlers();
        e['astNodeEditModeStop'] = () => e('astControlMode');
        e['ASTPrevVersion'] = () => tabManager.ASTPrevVersion();
        e['ASTNextVersion'] = () => tabManager.ASTNextVersion();
        e['runASTModule'] = async () => {
            const activeTab = tabManager.getActiveTab();
            if (!activeTab) return;

            const node = activeTab.getContextNode();
            const lastASTVersion = activeTab.getAstEditor().getLastASTVersion();
            const ASTRunner = new AstRunner();
            const js = ASTRunner.createJsCode(node, lastASTVersion);

            await new HttpClient().post('/process/start', {js});
        }
        e['markASTNode'] = async ([contextNode, ASTNode]) => {
            const contextNodeId = contextNode.get('id');
            let ASTNodeId = ASTNode.getId();
            if (ASTNode instanceof ModuleImports ||
                ASTNode instanceof ModuleCallableCondition ||
                ASTNode instanceof ModuleBody
            ) {
                ASTNodeId = ASTNode.constructor.name
            }

            localState.setMarkedASTNodeId(contextNodeId, ASTNodeId);
        }
        e['ASTChange'] = () => nodes.save();

        nodes.getV().on('click', () => e('nodesControlMode'));
        tabManager.getV().on('click', () => {
            if (tabManager.getActiveTab() && tabManager.getActiveTab().getAstEditor().isASTNodeEditorIsActive()) return;
            e('astControlMode');
        });
        e('astControlMode');

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

            const astEditor = tabManager.getActiveTab().getAstEditor();
            const module = astEditor.getModuleNode();
            const markedASTNodeId = localState.getMarkedASTNodeId(activeTabId);

            const map = {
                [ModuleImports.name]: module.getImports(),
                [ModuleCallableCondition.name]: module.getCallableCondition(),
                [ModuleBody.name]: module.getBody()
            }
            if (map[markedASTNodeId]) {
                astEditor.mark(map[markedASTNodeId]);
                return;
            }
            const markedASTNode = markedASTNodeId ? window.astPool.get(markedASTNodeId) : null;
            if (markedASTNode) {
                tabManager.getActiveTab().getAstEditor().mark(markedASTNode);
            }
        }
    }

    async show404Page(app) {
        const addNodeBtn = new V({class: ['btn'], txt: '404'});
        e('>', [addNodeBtn, app]);
    }

    async run() {
        this.initGlobals();

        this.app = new V;
        this.app.setDOM(document.getElementById('app'));

        const path = document.location.pathname
        const m = {
            '/': () => this.showIDE(this.app),
            '/sign/in': () => this.showSignPage(this.app, 'sign_in'),
            '/sign/up': () => this.showSignPage(this.app, 'sign_up'),
            '/process': () => this.showProcessPage(this.app),
        }
        if (m[path]) m[path]();


        navigation.addEventListener('navigate', navigateEvent => {
            const url = new URL(navigateEvent.destination.url);
            this.app.clear();
            navigateEvent.transitionWhile(m[url.pathname] ? m[url.pathname]() : this.show404Page(this.app) );
        });
    }
}

new AppBrowser().run();
