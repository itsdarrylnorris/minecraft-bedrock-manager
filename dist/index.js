"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const minecraft_1 = __importDefault(require("./services/minecraft"));
commander_1.default.version('0.0.1');
commander_1.default
    .option('-s, --start-server', 'Start the Minecraft Server')
    .option('-r, --restart-server', 'Restarts the Minecraft Server')
    .option('-st, --stop-server', 'Stop Minecraft Server')
    .option('-l, --logs', 'Show the Minecraft Logs');
commander_1.default.parse(process.argv);
const options = commander_1.default.opts();
if (options.startServer) {
    const minecraft = new minecraft_1.default({});
    minecraft.startServer();
}
else if (options.restartServer) {
    const minecraft = new minecraft_1.default({});
    minecraft.restartServer();
}
else if (options.stopServer) {
    const minecraft = new minecraft_1.default({});
    minecraft.stopServer();
}
else if (options.logs) {
    const minecraft = new minecraft_1.default({});
    minecraft.logs();
}
//# sourceMappingURL=index.js.map