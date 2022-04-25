import {NextFunction, Request, Response} from "express";
import FS from "../FS";
import Logger from "../../log/Logger";
import {fSet} from "../../F";
import OsExec from "../../exec/process/OsExec";
import {STATE_FILE_PATH} from "../../AppConstants";

const COOKIE_KEY = 'tok';

export default class HttpMsgHandler {

    fs: FS;
    logger: Logger;
    appDir: string

    constructor(fs: FS, logger: Logger, appDir: string) {
        this.fs = fs;
        this.logger = logger;
        this.appDir = appDir;
    }

    async isAuthorized(req: Request): Promise<boolean> {
        return !!req.cookies[COOKIE_KEY];
    }

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
        const htmlFile = this.appDir + '/src/browser/core/view/index.html';
        const pwaManifest = this.appDir + '/public/manifest.json';

        //const authKey = this.isAuthorized(req);

        const m = {
            'GET:/js': async () => res.send( await this.fs.readFile(this.appDir + '/min.js') ),
            'GET:/sign/in': async () => res.send( await this.fs.readFile(htmlFile) ),
            'GET:/sign/up': async () => res.send( await this.fs.readFile(htmlFile) ),
            'POST:/sign/in': async () => {
                const {email, pass} = req.body;

                if (!email) res.send({ok: 0, tx: 'Email is missing.'}); return;
                if (!pass) res.send({ok: 0, tx: 'Password is missing.'}); return;
            },
            'POST:/sign/up': async () => {

                //if user authorized perform redirect;

                const {email, pass} = req.body;
                if (!email) {
                    res.send({ok: 0, tx: 'Email is missing.'}); return;
                }
                if (email.length > 20) {
                    res.send({ok: 0, tx: 'Email length limit is 20 symbols.'}); return;
                }
                if (!pass) {
                    res.send({ok: 0, tx: 'Password is missing.'}); return;
                }
                if (pass.length > 20) {
                    res.send({ok: 0, tx: 'Password length limit is 20 symbols.'}); return;
                }

                //const authKey = RandBytes(32);
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
            'GET:/': async() => {
                /*if (!await this.authCheck(req)) {
                    res.redirect('/sign/in'); return;
                }*/
                res.send( await this.fs.readFile(htmlFile) );
            },
            'GET:/manifest.json': async() => res.send( await this.fs.readFile(pwaManifest) ),
            'GET:/pwa.png': async() => res.sendFile(this.appDir + '/public/pwa.png'),
            'GET:/serviceWorker.js': async() => res.send( await this.fs.readFile(this.appDir + '/public/serviceWorker.js'))
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