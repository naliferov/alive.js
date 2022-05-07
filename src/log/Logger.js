"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = /** @class */ (function () {
    function Logger(prefix) {
        if (prefix === void 0) { prefix = ''; }
        this.prefix = prefix;
    }
    Logger.prototype.setHandler = function (handler) { this.handler = handler; };
    Logger.prototype.log = function (msg, object) {
        object ? console.log(this.prefix + msg, object) : console.log(this.prefix + msg);
    };
    Logger.prototype.info = function (msg, object) {
        if (object === void 0) { object = null; }
        this.log(msg, object);
    };
    Logger.prototype.warning = function (msg, object) {
        if (object === void 0) { object = null; }
        this.log(msg, object);
    };
    Logger.prototype.error = function (msg, object) {
        if (object === void 0) { object = null; }
        this.log(msg, object);
    };
    return Logger;
}());
exports.default = Logger;
