import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export default class HttpServer {

    server;

    constructor(createServer, express, httpMsgHandler) {

        let app = express();

        app.use(express.static('src'));
        app.use(cookieParser());
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(async (req, res, next) => await httpMsgHandler.handle(req, res, next));
        this.server = createServer({}, app);
    }

    getServer() {
        return this.server;
    }
}

