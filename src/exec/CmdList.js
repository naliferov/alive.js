import OsExec from "./process/OsExec.js";
import HttpMsgHandler from "../io/http/HttpMsgHandler.js";
import HttpServer from "../io/http/HttpServer.js";
import http from "node:http";
import express from 'express';

export const cmdList = {
    'install': async (cliArgs, {fs, appDir, logger}) => {
        const runStr = `node ${appDir}/x.js $@`;
        const shFile = `${appDir}/install/fx.sh`;
        await fs.writeFile(shFile, runStr);

        await (new OsExec('sudo', ['chmod', '+x', shFile], '', logger)).run();
        await (new OsExec('sudo', ['rm', '/usr/bin/astEditor'], '', logger)).run();
        await (new OsExec('sudo', ['ln', '-s', shFile, '/usr/bin/astEditor'], '', logger)).run();

        await logger.info('Installation complete.');
    },
    'webpack': async (cliArgs, {logger}) => {
        await (new OsExec('webpack', [], '', logger)).run();
    },
    'webServer': async (cliArgs, {logger, fs, appDir, mongoManager}) => {
        await mongoManager.connect();
        await logger.info('Connected to mongo server.');

        const httpMsgHandler = new HttpMsgHandler(fs, logger, appDir, mongoManager);
        const httpServer = new HttpServer(http.createServer, express, httpMsgHandler);

        const port = cliArgs.port || '8080';
        httpServer.listen(port);
        await logger.info(`Webserver start on port: [${port}]`);
    },
}