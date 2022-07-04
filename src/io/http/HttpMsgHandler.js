import * as crypto from 'node:crypto';
import UsersModel from "../db/model/UsersModel.js";
import NodesModel from "../db/model/NodesModel.js";

const COOKIE_KEY = 'fx';

export default class HttpMsgHandler {

    fs;
    logger;
    appDir;
    usersModel;
    nodesModel;

    constructor(fs, logger, appDir, mongoManager) {
        this.fs = fs;
        this.logger = logger;
        this.appDir = appDir;
        this.usersModel = new UsersModel(mongoManager);
        this.nodesModel = new NodesModel(mongoManager);
    }

    userHasAuthKey(req) {
        return req.cookies[COOKIE_KEY];
    }

    async getAuthorizedUser(req) {
        const key = req.cookies[COOKIE_KEY];
        if (!key) return false;
        return await this.usersModel.getByAuthKey(key);
    }

    authorize(res, authKey) {
        res.cookie(COOKIE_KEY, authKey, { maxAge: (60 * 60 * 24) * (15 * 1000), httpOnly: true, secure: true, sameSite: 'Strict'});
    }

    async handle(req, res, next) {

        const htmlFile = await this.fs.readFile(this.appDir + '/src/browser/index.html');

        const m = {
            'GET:/': async() => {
                if (!this.userHasAuthKey(req)) { res.redirect('/sign/in'); return; }
                res.send(htmlFile);
            },
            'GET:/sign/in': async () => res.send(htmlFile),
            'POST:/sign/in': async () => {
                let {email, password} = req.body;
                email = email.trim();
                password = password.trim();

                if (!email) { res.send({err: 'Email is missing.'}); return; }
                if (!password) { res.send({err: 'Password is missing.'}); return; }

                const user = await this.usersModel.getByEmail(email);
                if (!user) { res.send({err: 'User not found.'}); return; }
                //const userId = resp._id.id.toString('hex');
                if (password !== user.password) { res.send({err: 'Wrong password.'}); return; }

                this.authorize(res, user.authKey);
                res.redirect('/');
            },
            'GET:/sign/up': async () => res.send(htmlFile),
            'POST:/sign/up': async () => {
                let {email, password} = req.body;
                email = email.trim();
                password = password.trim();

                if (!email) {
                    res.send({err: 'Email is missing.'}); return;
                }
                if (email.length > 20) {
                    res.send({err: 'Email length limit is 20 symbols.'}); return;
                }
                if (!password) {
                    res.send({err: 'Password is missing.'}); return;
                }
                if (password.length > 20) {
                    res.send({err: 'Password length limit is 20 symbols.'}); return;
                }

                const authKey = crypto.randomBytes(32).toString('hex');
                const userId = await this.usersModel.insert(email, password, authKey);

                await this.nodesModel.insert(userId, []);
                this.authorize(res, authKey);
            },
            'GET:/process/start': async () => {
                await this.logger.info(req.query);
                res.send();
            },

            'GET:/process/stop': async () => {

                const processName = req.query.processName;
                /*const fileSet = fSet(PIDS_FILE);
                const pid = await fileSet.r(processName);
                if (!pid) {
                    res.send({ok: `PID not found for process name ${processName}.`});
                    return;
                }
                await (new OsExec('kill', [pid], '', new Logger())).run();
                await fileSet.d(processName);*/
                res.send({ok: processName});
            },
            'GET:/deploy': async () => {

                if (!await this.getAuthorizedUser(req)) {
                    res.send({err: 'forbidden'});
                    return;
                }
                //await (new OsExec('node x.js webServer ', [], '', this.logger)).run();

                res.send();
                /*const fileSet = fSet(PIDS_FILE);
                const pid = await fileSet.r(processName);
                if (!pid) {
                    res.send({ok: `PID not found for process name ${processName}.`});
                    return;
                }
                await (new OsExec('kill', [pid], '', new Logger())).run();
                await fileSet.d(processName);*/
                //res.send({ok: processName});
            },
            'GET:/nodes': async () => {
                const user = await this.getAuthorizedUser(req);
                if (!user) { res.send({err: 'User not found.'}); return; }
                const userNodes = await this.nodesModel.getByUserId(user._id);
                res.send(userNodes.nodes);
            },
            'POST:/nodes': async () => {

                const user = await this.getAuthorizedUser(req);

                if (!user) { res.send({err: 'User not found.'}); return; }
                if (!req.body.nodes) { res.send({err: 'OutlinerNode is empty.'}); return; }

                const userNodes = await this.nodesModel.getByUserId(user._id);
                if (!userNodes) {
                    res.send({err: `User nodes not found for userId [${user._id}]`});
                }

                await this.nodesModel.update(user._id, req.body.nodes);
                res.send({code: 0});
            },
        };

        const name = `${req.method}:${req.path}`;
        if (m[name]) await m[name]();

        next();
    }
}