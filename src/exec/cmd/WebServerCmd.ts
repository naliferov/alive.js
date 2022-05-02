import HttpMsgHandler from "../../io/http/HttpMsgHandler";
import HttpServer from "../../io/http/HttpServer";
import {createServer} from "http";
import FS from "../../io/fs/FS";
import Logger from "../../log/Logger";
import * as express from "express";
import MongoManager from "../../io/db/MongoManager";

export default class WebServerCmd {

    async run(
        port: string, fs: FS, logger: Logger, appDir: string, mongoManager: MongoManager
    ) {
        await mongoManager.connect();
        await logger.info('Connected to mongo server.');

        const httpMsgHandler = new HttpMsgHandler(fs, logger, appDir, mongoManager);
        const httpServer = new HttpServer(createServer, express, httpMsgHandler);
        //new WSServer(httpServer, stateManager, fs);

        httpServer.getServer().listen(`${port}`);
        await logger.info(`Webserver start on port: [${port}]`);
    }
}