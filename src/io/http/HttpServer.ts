import {Express, NextFunction, Request, Response} from "express";
import {Server} from "http";
import HttpMsgHandler from "./HttpMsgHandler";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";

export default class HttpServer {

    server: Server;

    constructor(createServer: any, express: Express, httpMsgHandler: HttpMsgHandler) {
        let app = express();
        app.use(cookieParser());
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(async (req: Request, res: Response, next: NextFunction) => await httpMsgHandler.handle(req, res, next));
        this.server = createServer({}, app);
    }

    getServer(): Server {
        return this.server;
    }
}

