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
const discord_js_1 = __importDefault(require("discord.js"));
const fs_1 = require("fs");
const node_watch_1 = __importDefault(require("node-watch"));
const os_1 = __importDefault(require("os"));
const shelljs_1 = __importDefault(require("shelljs"));
const zip_local_1 = __importDefault(require("zip-local"));
require('dotenv').config();
class Minecraft {
    constructor(options) {
        this.logging = (message, payload = null) => {
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
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                path: process.env.OPTIONS_PATH || os_1.default.homedir() + '/MinecraftServer/',
                backup_path: process.env.BACKUP_PATH || os_1.default.homedir() + '/Backups/',
                log_file: process.env.LOG_FILE || os_1.default.homedir() + '/minecraft-server.log',
                discordId: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
                discordToken: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
                strings: {
                    pre_backup_message: process.env.options_pre_backup_message ||
                        'We are shutting down the server temporary, we are making a backup.',
                    post_backup_message: process.env.options_post_backup_message || 'We are done with the backup, the server is back on.',
                    error_backup_message: process.env.options_error_backup_message || 'Something went wrong while building out the backup',
                },
            };
        }
    }
    startBackup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sendMessageToDiscord(this.options.strings.pre_backup_message);
                yield this.stopServer();
                yield this.compressFile();
                yield this.startServer();
            }
            catch (e) {
                this.logging(e);
                this.sendMessageToDiscord(this.options.strings.post_backup_message);
            }
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Stopping server');
        });
    }
    compressFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Compressing file');
            let date = new Date();
            try {
                shelljs_1.default.cd(this.options.backup_path);
                yield zip_local_1.default.sync.zip(this.options.path).compress().save(`${date.toISOString()}-minecraft.zip`);
            }
            catch (err) {
                console.log(err);
            }
            this.logging('Done Compressing file. Deleted MinecraftServer Folder');
        });
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Sending this message to discord', string);
            try {
                const webhook = new discord_js_1.default.WebhookClient(this.options.discordId, this.options.discordToken);
                yield webhook.send(string);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    logs() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Watching for changes');
            let file = yield fs_1.promises.readFile(this.options.log_file, 'utf8');
            let fileNumber = file.split(/\n/).length;
            node_watch_1.default(this.options.log_file, (evt, name) => __awaiter(this, void 0, void 0, function* () {
                if (evt === 'update') {
                    let newFile = yield fs_1.promises.readFile(name, 'utf8');
                    let newFileNumber = newFile.split(/\n/).length;
                    console.log({ newFileNumber });
                    for (let index = 0; index < newFileNumber; index++) {
                        console.log({ fileNumber });
                        console.log({ newFileNumber });
                        if (fileNumber < newFileNumber) {
                            const element = newFile.split(/\n/)[index];
                            console.log({ element });
                        }
                    }
                }
            }));
        });
    }
}
exports.default = Minecraft;
//# sourceMappingURL=minecraft.js.map