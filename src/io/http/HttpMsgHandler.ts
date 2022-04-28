import {NextFunction, Request, Response} from "express";
import FS from "../fs/FS";
import Logger from "../../log/Logger";
import {STATE_FILE_PATH} from "../../AppConstants";
import * as crypto from 'crypto';
import MongoManager from "../db/MongoManager";

const COOKIE_KEY = 'fx';

export default class HttpMsgHandler {

    fs: FS;
    mongoManager: MongoManager;
    logger: Logger;
    appDir: string

    constructor(fs: FS, logger: Logger, appDir: string, mongoManager: MongoManager) {
        this.fs = fs;
        this.mongoManager = mongoManager;
        this.logger = logger;
        this.appDir = appDir;
    }

    isAuthorized(req: Request) { return !!req.cookies[COOKIE_KEY]; }

    async authorize(res: Response, authKey: string) {
        res.cookie(COOKIE_KEY, authKey, { maxAge: (60 * 60 * 24) * 15 * 1000, httpOnly: true, secure: true });
    }

    /*async authCheck(req: Request): Promise<boolean> {

        const authKey = req.cookies[COOKIE_KEY];
        if (!authKey) {
            return false;
        }

        const usersModel = new Users;
        const user = await usersModel.findByAuthKey(authKey);

        return !!user;
    }*/

    async handle(req: Request, res: Response, next: NextFunction) {

        const stateFile = this.appDir + STATE_FILE_PATH.substring(1);
        const htmlFile = await this.fs.readFile(this.appDir + '/src/browser/core/view/index.html');
        const isAuthorized = this.isAuthorized(req);

        const m = {
            'GET:/js': async () => res.send( await this.fs.readFile(this.appDir + '/public/min.js') ),
            'GET:/': async() => {
                if (!this.isAuthorized(req)) {
                    res.redirect('/sign/in'); return;
                }
                res.send(htmlFile);
            },
            'GET:/sign/authorized': async () => res.send({isAuthorized}),
            'GET:/sign/in': async () => {
                //если залогинен и пароль верный надо залогинить
                res.send(htmlFile)
            },
            'POST:/sign/in': async () => {
                const {email, pass} = req.body;

                console.log(email, pass);

                if (!email) res.send({ok: 0, tx: 'Email is missing.'}); return;
                if (!pass) res.send({ok: 0, tx: 'Password is missing.'}); return;
            },
            'GET:/sign/up': async () => res.send(htmlFile),
            'POST:/sign/up': async () => {

                const {email, password} = req.body;

                if (!email) {
                    res.send({ok: 0, tx: 'Email is missing.'}); return;
                }
                if (email.length > 20) {
                    res.send({ok: 0, tx: 'Email length limit is 20 symbols.'}); return;
                }
                if (!password) {
                    res.send({ok: 0, tx: 'Password is missing.'}); return;
                }
                if (password.length > 20) {
                    res.send({ok: 0, tx: 'Password length limit is 20 symbols.'}); return;
                }

                const authKey = crypto.randomBytes(32).toString('hex');
                res.send({ok: 1});
                /*const usersModel = new Users;

                if (await usersModel.findByEmail(email)) {
                    res.send({ok: 0, tx: 'User with this email already exists.'}); return;
                }

                const user = await usersModel.insert({email, pass, authKey});
                console.log('User sign up', user);

                await this.authorize(res, authKey);
                res.send({ok: 1});*/
            },
            'GET:/sign/out': async () => {},
            'GET:/process/start': async () => {

                //запуск скрипта

                await this.logger.info(req.query);
                res.send({ok: 1});
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
            'GET:/state': async () => {
                res.send( await this.fs.readFile(stateFile) );
            },
            'POST:/state': async () => {
                //security
                if (!req.body.data) {
                    res.send({ok: 0, tx: 'Data is empty.'}); return;
                }

                await this.fs.writeFile(stateFile, JSON.stringify(req.body.data))
                res.send({});
            },
        };

        const reqName = `${req.method}:${req.path}`;
        if (m[reqName]) {
            await m[reqName]();
            return;
        }

        next();
        return;
    }
}