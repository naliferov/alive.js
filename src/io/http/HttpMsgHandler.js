"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("../../log/Logger");
var RandBytes_1 = require("../../RandBytes");
var F_1 = require("../../F");
var Exec_1 = require("../../exec/process/OsExec");
var ExecConstants_1 = require("../../exec/ExecConstants");
var COOKIE_KEY = 'tok';
var HttpMsgHandler = /** @class */ (function () {
    function HttpMsgHandler(fs, logger) {
        this.fs = fs;
        this.logger = logger;
    }
    HttpMsgHandler.prototype.isAuthorized = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, !!req.cookies[COOKIE_KEY]];
            });
        });
    };
    HttpMsgHandler.prototype.authorize = function (res, authKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.cookie(COOKIE_KEY, authKey, { maxAge: (60 * 60 * 24) * 15 * 1000, httpOnly: true, secure: true });
                return [2 /*return*/];
            });
        });
    };
    /*async authCheck(req: Request): Promise<boolean> {

        const authKey = req.cookies[COOKIE_KEY];
        if (!authKey) {
            return false;
        }

        const usersModel = new Users;
        const user = await usersModel.findByAuthKey(authKey);

        return !!user;
    }*/
    HttpMsgHandler.prototype.handle = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var stateFile, htmlFile, m, reqName;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateFile = './state.json';
                        htmlFile = './src/browser/view/index.html';
                        m = {
                            'GET:/js': function () { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = res).send;
                                        return [4 /*yield*/, this.fs.readFile('./min.js')];
                                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                                }
                            }); }); },
                            'GET:/process/start': function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    console.log(req.query);
                                    res.send({ ok: 1 });
                                    return [2 /*return*/];
                                });
                            }); },
                            'GET:/sign/in': function () { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = res).send;
                                        return [4 /*yield*/, this.fs.readFile(htmlFile)];
                                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                                }
                            }); }); },
                            'GET:/sign/up': function () { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = res).send;
                                        return [4 /*yield*/, this.fs.readFile(htmlFile)];
                                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                                }
                            }); }); },
                            'POST:/sign/in': function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, email, pass;
                                return __generator(this, function (_b) {
                                    _a = req.body, email = _a.email, pass = _a.pass;
                                    if (!email)
                                        res.send({ ok: 0, tx: 'Email is missing.' });
                                    return [2 /*return*/];
                                });
                            }); },
                            'POST:/sign/up': function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, email, pass, authKey;
                                return __generator(this, function (_b) {
                                    _a = req.body, email = _a.email, pass = _a.pass;
                                    if (!email) {
                                        res.send({ ok: 0, tx: 'Email is missing.' });
                                        return [2 /*return*/];
                                    }
                                    if (email.length > 20) {
                                        res.send({ ok: 0, tx: 'Email length limit is 20 symbols.' });
                                        return [2 /*return*/];
                                    }
                                    if (!pass) {
                                        res.send({ ok: 0, tx: 'Password is missing.' });
                                        return [2 /*return*/];
                                    }
                                    if (pass.length > 20) {
                                        res.send({ ok: 0, tx: 'Password length limit is 20 symbols.' });
                                        return [2 /*return*/];
                                    }
                                    authKey = RandBytes_1.default(32);
                                    return [2 /*return*/];
                                });
                            }); },
                            'GET:/sign/out': function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/];
                            }); }); },
                            'GET:/process/list': function () { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = res).send;
                                        return [4 /*yield*/, F_1.default().fl(ExecConstants_1.PIDS_FILE).r()];
                                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                                }
                            }); }); },
                            'GET:/process/stop': function () { return __awaiter(_this, void 0, void 0, function () {
                                var processName, fSet, pid;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            processName = req.query.processName;
                                            fSet = F_1.default().fSet(ExecConstants_1.PIDS_FILE);
                                            return [4 /*yield*/, fSet.r(processName)];
                                        case 1:
                                            pid = _a.sent();
                                            if (!pid) {
                                                res.send({ ok: "PID not found for process name " + processName + "." });
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, (new Executor.default('kill', [pid], '', new Logger_1.default())).run()];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, fSet.d(processName)];
                                        case 3:
                                            _a.sent();
                                            res.send({ ok: processName });
                                            return [2 /*return*/];
                                    }
                                });
                            }); },
                            'GET:/state': function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _b = (_a = res).send;
                                            return [4 /*yield*/, this.fs.readFile(stateFile)];
                                        case 1:
                                            _b.apply(_a, [_c.sent()]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); },
                            'POST:/state': function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            //security
                                            if (!req.body.data) {
                                                res.send({ ok: 0, tx: 'Data is empty.' });
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, this.fs.writeFile(stateFile, JSON.stringify(req.body.data))];
                                        case 1:
                                            _a.sent();
                                            res.send({});
                                            return [2 /*return*/];
                                    }
                                });
                            }); },
                            'GET:/': function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            /*if (!await this.authCheck(req)) {
                                                res.redirect('/sign/in'); return;
                                            }*/
                                            _b = (_a = res).send;
                                            return [4 /*yield*/, this.fs.readFile(htmlFile)];
                                        case 1:
                                            /*if (!await this.authCheck(req)) {
                                                res.redirect('/sign/in'); return;
                                            }*/
                                            _b.apply(_a, [_c.sent()]);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        };
                        reqName = req.method + ":" + req.path;
                        if (!m[reqName]) return [3 /*break*/, 2];
                        return [4 /*yield*/, m[reqName]()];
                    case 1:
                        _a.sent();
                        next();
                        return [2 /*return*/];
                    case 2:
                        next();
                        return [2 /*return*/];
                }
            });
        });
    };
    return HttpMsgHandler;
}());
exports.default = HttpMsgHandler;
