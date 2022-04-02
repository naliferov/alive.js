import U from "./core/U";
import State from "./module/mindfields/state/State";
import FxRuntime from "./module/fx/FxRuntime";
import WSClient from "./core/io/WSClient";
import Pubsub from "../io/pubsub/Pubsub";
import MindFields from "./module/mindfields/MindFields";
import InputAction from "./core/io/InputAction";
import {
    FX_RUNTIME_GET_FOCUS, FX_RUNTIME_OPEN_TAB,
    MINDFIELDS_GET_FOCUS,
    MINDFIELDS_INSERTING_CHUNK
} from "../io/pubsub/PubsubConstants";
import FxTabManager from "./module/fx/fxRuntime/tab/FxTabManager";
import BaseChunk from "./module/fx/fxRuntime/tab/chunks/BaseChunk";
import LocalState from "./module/mindfields/state/Localstate";

class AppBrowser {

    async run(window: Window) {
        
        if ('serviceWorker' in window.navigator) window.navigator.serviceWorker.register('./serviceWorker.js');

        // @ts-ignore
        window.chunkPool = new Map<string, BaseChunk>();

        const app = new U({});
        app.setDOM(document.getElementById('app'));

        const state = new State();
        const pubsub = new Pubsub();
        const mindFields = new MindFields(state, pubsub);
        await mindFields.init(app);
        const localState = new LocalState();
        const wsClient = new WSClient();
        await wsClient.connect();

        const fxTabManager = new FxTabManager(pubsub, mindFields, localState);
        const fxRuntime = new FxRuntime(mindFields, wsClient, pubsub, fxTabManager);
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
}

new AppBrowser().run(window);
