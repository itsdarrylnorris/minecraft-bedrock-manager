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
const chokidar_1 = __importDefault(require("chokidar"));
const discord_js_1 = __importDefault(require("discord.js"));
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const shelljs_1 = __importDefault(require("shelljs"));
const zip_local_1 = __importDefault(require("zip-local"));
const utils_1 = require("../utils");
require('dotenv').config();
class Minecraft {
    constructor(options) {
        this.logs_strings = {
            player_disconnected: '[INFO] Player disconnected:',
            player_connected: '[INFO] Player connected:',
        };
        this.minecraft_screen_name = 'Minecraft';
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                path: process.env.OPTIONS_PATH || os_1.default.homedir() + '/MinecraftServer/worlds',
                backup_path: process.env.BACKUP_PATH || os_1.default.homedir() + '/Backups/',
                log_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/minecraft-server.log',
                discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
                discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
                strings: {
                    pre_backup_message: process.env.options_pre_backup_message ||
                        'We are shutting down the server temporary, we are making a backup.',
                    post_backup_message: process.env.options_post_backup_message || 'We are done with the backup, the server is back on.',
                    error_backup_message: process.env.options_error_backup_message || 'Something went wrong while building out the backup',
                },
            };
        }
    }
    restartServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sendMessageToDiscord(this.options.strings.pre_backup_message);
                yield this.stopServer();
                yield this.compressFile();
                yield this.startServer();
            }
            catch (e) {
                utils_1.logging(e);
                this.sendMessageToDiscord(this.options.strings.post_backup_message);
            }
            return;
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging('Starting up the server');
            this.executeShellScript(`cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `);
            this.sendMessageToDiscord(`[${os_1.default.hostname()}] Starting up server`);
        });
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging('Stopping server');
            this.executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`);
            this.sendMessageToDiscord(`[${os_1.default.hostname()}] Stopping the server`);
        });
    }
    executeShellScript(string) {
        utils_1.logging(`Executing this shell command: ${string}`);
        let results = '';
        results = shelljs_1.default.exec(string, { silent: true }).stdout;
        utils_1.logging('Execution output', results);
        return results;
    }
    compressFile() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging('Compressing file');
            let date = new Date();
            try {
                shelljs_1.default.cd(this.options.backup_path);
                yield zip_local_1.default.sync.zip(this.options.path).compress().save(`${date.toISOString()}-minecraft.zip`);
            }
            catch (err) {
                utils_1.logging('Error', err);
            }
            utils_1.logging('Done Compressing file. Deleted MinecraftServer Folder');
            return;
        });
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging('Sending this message to discord', string);
            try {
                const webhook = new discord_js_1.default.WebhookClient(this.options.discord_id, this.options.discord_token);
                yield webhook.send(string);
            }
            catch (err) {
                utils_1.logging('Something went wrong posting the discord message', err);
            }
            return;
        });
    }
    logs() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging('Watching for changes');
            let file = yield fs_1.promises.readFile(this.options.log_file, 'utf8');
            let fileNumber = file.split(/\n/).length;
            chokidar_1.default.watch(this.options.log_file).on('all', (evt, path) => __awaiter(this, void 0, void 0, function* () {
                console.log(evt, path);
                if (evt === 'change') {
                    let newFile = yield fs_1.promises.readFile(path, 'utf8');
                    let newFileNumber = newFile.split(/\n/).length;
                    if (fileNumber < newFileNumber) {
                        const element = newFile.split(/\n/)[newFileNumber - 2];
                        if (element.includes(this.logs_strings.player_disconnected)) {
                            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_disconnected);
                            this.sendMessageToDiscord(`${gamerTag} left the Minecraft server.`);
                        }
                        else if (element.includes(this.logs_strings.player_connected)) {
                            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected);
                            this.sendMessageToDiscord(`${gamerTag} joined the Minecraft server.`);
                        }
                    }
                    fileNumber = newFile.split(/\n/).length;
                }
            }));
        });
    }
    getGamerTagFromLog(logString, logIndentifier) {
        return logString.split(logIndentifier)[1].split(',')[0].split(' ')[1];
    }
}
exports.default = Minecraft;
//# sourceMappingURL=minecraft.js.map