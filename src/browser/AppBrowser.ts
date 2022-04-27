import U from "./core/U";
import State from "./module/outliner/state/State";
import FxRuntime from "./module/astEditor/FxRuntime";
import Pubsub from "../io/pubsub/Pubsub";
import Fields from "./module/outliner/Fields";
import InputAction from "./core/io/InputAction";
import {
    FX_RUNTIME_GET_FOCUS, FX_RUNTIME_OPEN_TAB,
    MINDFIELDS_GET_FOCUS,
    MINDFIELDS_INSERTING_CHUNK
} from "../io/pubsub/PubsubConstants";
import FxTabManager from "./module/astEditor/tab/FxTabManager";
import BaseChunk from "./module/astEditor/tab/chunks/BaseChunk";
import LocalState from "./module/outliner/state/Localstate";
import HttpClient from "../io/http/HttpClient";

class AppBrowser {

    app: U
    input: InputAction

    async showSignPage(app: U, type: string) {

        const isSignIn = type === 'sign_in';
        const formName = isSignIn ? 'Sign in': 'Sign up';

        const pageSign = new U({class: ['pageSign']});
        app.in(pageSign);

        const signContainer = new U({class: ['signContainer']});
        pageSign.in(signContainer);

        const sign = new U({class: ['signBlock']});
        signContainer.in(sign);

        sign.in(new U({txt: formName})).inBr();

        sign.in(new U({txt: 'Email'}));
        const email = new U({tagName: 'input', class: ['emailInput']});
        sign.in(email).inBr();

        sign.in(new U({txt: 'Password'}));
        const password = new U({tagName: 'input', class: ['emailInput']});
        sign.in(password);

        sign.inBr().inBr();
        const btn = new U({tagName: 'button', txt: formName})
        sign.in(btn);

        btn.on('click', async () => {
            const data = {email: email.getValue(), password: password.getValue()};
            await new HttpClient().post(document.location.pathname, data);
            document.location.reload();
        });

        if (isSignIn) {
            sign.inBr().inBr();
            sign.in(new U({tagName: 'span', txt: "Don't have an account? "}));
            sign.in(new U({tagName: 'a', txt: "Sign up"}).setAttr('href', '/sign/up'));
        }

        //Don't have an account? Sign up
    }

    async showSettings(app: U) {

    }

    async showFx(app: U) {

        // @ts-ignore
        window.chunkPool = new Map<string, BaseChunk>();
        const state = new State();
        const pubsub = new Pubsub();
        const mindFields = new Fields(state, pubsub);
        await mindFields.init(app);
        const localState = new LocalState();

        const fxTabManager = new FxTabManager(pubsub, mindFields, localState);
        const fxRuntime = new FxRuntime(mindFields, pubsub, fxTabManager);
        await fxRuntime.init(app);
        const inputAction = new InputAction(window);

        const mindFieldsFocus = () => {
            inputAction.onKeyDown(async (e) => await mindFields.handleKeyDown(e));
            inputAction.onKeyUp(async (e) => await mindFields.handleKeyUp(e));
            inputAction.onClick(async (e) => await mindFields.handleClick(e));
        }
        const fxRuntimeFocus = () => inputAction.onKeyDown(async (e) => await fxRuntime.onKeyDown(e));

        pubsub.sub(FX_RUNTIME_GET_FOCUS, () => fxRuntimeFocus());
        pubsub.sub(FX_RUNTIME_OPEN_TAB, ({unit}) => fxRuntime.openTab(unit));
        pubsub.sub(MINDFIELDS_GET_FOCUS, () => mindFieldsFocus());
        pubsub.sub(MINDFIELDS_INSERTING_CHUNK, () => inputAction.disableHandlers());

        fxRuntime.onClick(() => pubsub.pub(FX_RUNTIME_GET_FOCUS));
        mindFields.getUnit().on('click', () => pubsub.pub(MINDFIELDS_GET_FOCUS));

        pubsub.pub(FX_RUNTIME_GET_FOCUS);

        const openedFx = localState.getOpenedTabs();

        for (let fxId in openedFx) {
            const unit = await mindFields.getById(fxId);
            if (!unit) {
                localState.closeTab(fxId);
                continue;
            }
            await fxRuntime.openTab(unit);
            //todo restore marker position
        }

        const activeTabId = localState.getActiveTabId();
        if (activeTabId) {
            const unit = await mindFields.getById(activeTabId);
            await fxRuntime.focusTab(unit);
        }
    }

    async run(window: Window) {

        this.app = new U({});
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

new AppBrowser().run(window);
