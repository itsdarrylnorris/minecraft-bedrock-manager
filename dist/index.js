"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = __importDefault(require("commander"));
const figlet_1 = __importDefault(require("figlet"));
const discord_1 = __importDefault(require("./services/discord"));
const minecraft_1 = __importDefault(require("./services/minecraft"));
commander_1.default.version('0.0.1');
commander_1.default
    .option('-h, --help', 'Display help for command')
    .option('-s, --start-server', 'Start the Minecraft Server')
    .option('-r, --restart-server', 'Restarts the Minecraft Server')
    .option('-st, --stop-server', 'Stop Minecraft Server')
    .option('-l, --logs', 'Show the Minecraft Logs')
    .option('-d, --discord', 'Start Discord');
commander_1.default.parse(process.argv);
const main = () => {
    const options = commander_1.default.opts();
    const NO_COMMAND_SPECIFIED = Object.keys(options).length === 0;
    if (NO_COMMAND_SPECIFIED || options.help) {
        console.log(chalk_1.default.bgHex('#52307c').bold(figlet_1.default.textSync('minecraft-manager', { horizontalLayout: 'full' })));
        commander_1.default.help();
    }
    else if (options.startServer) {
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
    else if (options.discord) {
        const minecraft = new discord_1.default({});
        minecraft.startDiscord();
    }
};
main();
//# sourceMappingURL=index.js.map