import Main from "./nodes/Main";

export default class Translator {

    buildJsModule(mainChunk: Main) {
        return mainChunk.serializeSubChunks();
    }
}