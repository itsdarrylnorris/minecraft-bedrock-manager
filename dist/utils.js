"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logging = void 0;
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
//# sourceMappingURL=utils.js.map