import Main from "./tab/nodes/Main";

export default class Translator {

    buildJsModule(mainChunk: Main) {
        return mainChunk.serializeSubChunks();
    }
}