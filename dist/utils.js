"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeShellScript = exports.logging = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const logging = function (message, payload = null) {
    let date = new Date();
    console.log(`[${date.toISOString()}] ${message}`);
    if (payload) {
        if (typeof payload === 'string' || payload instanceof String) {
            console.log(`[${date.toISOString()}] ${payload}`);
        }
        else {
            console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`);
        }
    }
};
exports.logging = logging;
const executeShellScript = function (string) {
    logging(`Executing this shell command: ${string}`);
    let results;
    if (process.env.ENVIRONMENT !== 'DEVELOPMENT') {
        results = shelljs_1.default.exec(string, { silent: true });
    }
    logging('Execution output', results);
    return results;
};
exports.executeShellScript = executeShellScript;
//# sourceMappingURL=utils.js.map