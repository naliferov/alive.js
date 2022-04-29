import {NextFunction, Request, Response} from "express";
import FS from "../fs/FS";
import Logger from "../../log/Logger";
import {STATE_FILE_PATH} from "../../AppConstants";
import * as crypto from 'crypto';
import MongoManager from "../db/MongoManager";
import UsersModel from "../db/model/UsersModel";

const COOKIE_KEY = 'fx';

export default class HttpMsgHandler {

    fs: FS;
    logger: Logger;
    appDir: string;
    usersModel: UsersModel;

    constructor(fs: FS, logger: Logger, appDir: string, mongoManager: MongoManager) {
        this.fs = fs;
        this.logger = logger;
        this.appDir = appDir;
        this.usersModel = new UsersModel(mongoManager);
    }

    isAuthorized(req: Request) { return !!req.cookies[COOKIE_KEY]; }

    authorize(res: Response, authKey: string) {
        res.cookie(COOKIE_KEY, authKey, { maxAge: (60 * 60 * 24) * (15 * 1000), httpOnly: true, secure: true, sameSite: 'Strict'});
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
            'GET:/sign/in': async () => res.send(htmlFile),
            'POST:/sign/in': async () => {
                let {email, password} = req.body;
                email.trim(); password.trim();

                console.log(email, password);
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

                const {email, password} = req.body;

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
                await this.usersModel.insert(email, password, authKey);

                this.authorize(res, authKey);
                res.send();
            },
            'GET:/sign/out': async () => {},
            'GET:/process/start': async () => {

                //запуск скрипта

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
            'GET:/state': async () => {
                res.send( await this.fs.readFile(stateFile) );
            },
            'POST:/state': async () => {
                //security
                if (!req.body.data) { res.send({code: 1, tx: 'Data is empty.'}); return; }

                await this.fs.writeFile(stateFile, JSON.stringify(req.body.data))
                res.send({code: 0});
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