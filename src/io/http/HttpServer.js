import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export default class HttpServer {

    server;

    constructor(createServer, express, httpMsgHandler) {

        let app = express();

        app.use(cookieParser());
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(express.static('src'));
        app.use(async (req, res, next) => await httpMsgHandler.handle(req, res, next));
        this.server = createServer({}, app);
    }

    listen(port) { this.server.listen(port); }
    getServer() { return this.server; }
}

