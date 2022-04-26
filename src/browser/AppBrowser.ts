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

    async showSignIn(app: U) {

        app.inBr();

        app.in(new U({txt: 'Email'}));
        const email = new U({tagName: 'input', class: ['emailInput']});
        app.in(email);
        app.inBr();

        app.in(new U({txt: 'Password'}));
        const password = new U({tagName: 'input', class: ['emailInput']});
        app.in(password);
    }

    async showSignUp(app: U) {

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

        const {data: {isAuthorized}} = await new HttpClient().get('/sign/authorized');
        if (isAuthorized) {


        } else {
            await this.showSignIn(this.app);
        }

        //await this.showFx(this.app);
    }
}

new AppBrowser().run(window);
