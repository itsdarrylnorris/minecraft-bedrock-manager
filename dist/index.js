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
    .option('-h, --help', 'Display help commands')
    .option('-s, --start-server', 'Starts the Minecraft Server')
    .option('-r, --restart-server', 'Restarts the Minecraft Server')
    .option('-st, --stop-server', 'Stops Minecraft Server')
    .option('-l, --logs', 'Shows the Minecraft Logs')
    .option('-d, --discord', 'Starts Discord');
commander_1.default.parse(process.argv);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = commander_1.default.opts();
    const NO_COMMAND_SPECIFIED = Object.keys(options).length === 0;
    if (NO_COMMAND_SPECIFIED || options.help) {
        console.log(chalk_1.default.bgHex('#52307c').bold(figlet_1.default.textSync('minecraft-manager', { horizontalLayout: 'full' })));
        commander_1.default.help();
    }
    else if (options.startServer) {
        const minecraft = new minecraft_1.default({});
        yield minecraft.startServer();
        process.exit();
    }
    else if (options.restartServer) {
        const minecraft = new minecraft_1.default({});
        yield minecraft.restartServer();
        process.exit();
    }
    else if (options.stopServer) {
        const minecraft = new minecraft_1.default({});
        yield minecraft.stopServer();
        process.exit();
    }
    else if (options.logs) {
        const minecraft = new minecraft_1.default({});
        minecraft.logs();
    }
    else if (options.discord) {
        const minecraft = new discord_1.default({});
        minecraft.startDiscord();
    }
});
main();
//# sourceMappingURL=index.js.map