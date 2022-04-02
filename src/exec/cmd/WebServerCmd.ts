import HttpMsgHandler from "../../io/http/HttpMsgHandler";
import HttpServer from "../../io/http/HttpServer";
import {createServer} from "http";
import WSServer from "../../io/http/WSServer";
import FS from "../../io/FS";
import Logger from "../../log/Logger";
import * as express from "express";
import StateManager from "../../io/state/StateManager";

export default class WebServerCmd {
    async run(port: string, fs: FS, logger: Logger, stateManager: StateManager, appDir: string) {

        await logger.info('Run webserver.');

        const httpMsgHandler = new HttpMsgHandler(fs, logger, appDir);
        const httpServer = new HttpServer(createServer, express, httpMsgHandler);
        new WSServer(httpServer, stateManager, fs);

        httpServer.getServer().listen(`${port}`);
        await logger.info(`Webserver start on port: [${port}]`);
    }
}