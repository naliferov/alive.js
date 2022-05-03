import Main from "./tab/chunks/Main";

export default class Translator {

    buildJsModule(mainChunk: Main) {
        return mainChunk.serializeSubChunks();
    }
}