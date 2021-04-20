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
const cheerio_1 = __importDefault(require("cheerio"));
const chokidar_1 = __importDefault(require("chokidar"));
const discord_js_1 = __importDefault(require("discord.js"));
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const os_1 = __importDefault(require("os"));
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
                path: process.env.OPTIONS_PATH || os_1.default.homedir() + '/MinecraftServer/',
                backup_path: process.env.BACKUP_PATH || os_1.default.homedir() + '/Backups/',
                download_path: process.env.DOWNLOAD_PATH || os_1.default.homedir() + '/downloads/',
                log_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/minecraft-server.log',
                discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
                discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
                numbers: {
                    max_number_files_in_downloads_folder: process.env.options_max_number_files_in_downloads_folder || 3,
                },
                strings: {
                    pre_backup_message: process.env.options_pre_backup_message ||
                        'We are shutting down the server temporarily. We are making a backup.',
                    post_backup_message: process.env.options_post_backup_message || 'We are done with the backup. The server is back on.',
                    error_backup_message: process.env.options_error_backup_message || 'Something went wrong while building out the backup.',
                    start_server_message: process.env.options_start_server_message || 'Starting up the server.',
                    stop_server_message: process.env.options_stop_server_message || 'Stopping the server.',
                    start_compressing_files_message: process.env.options_start_compressing_files_message || 'Starting to compress files.',
                    end_compressed_files_message: process.env.options_end_compressed_files_message || 'Files are now compressed.',
                    sending_discord_message: process.env.options_sending_discord_message || 'Sending this message to Discord.',
                    error_discord_message: process.env.options_error_discord_message || 'Something went wrong when sending the Discord message.',
                    gamertag_join_server_message: process.env.options_gamertag_join_server_message || 'joined the Minecraft server.',
                    gamertag_left_server_message: process.env.options_gamertag_left_server_message || 'left the Minecraft server.',
                    version_download: process.env.options_versions_downloads || 'https://www.minecraft.net/en-us/download/server/bedrock/',
                    download_button: process.env.options_download_button || '[data-platform="serverBedrockLinux"]',
                    not_up_to_date_server_message: process.env.options_not_up_to_date_server_message ||
                        `Server is not up to date. Updating server to latest version: `,
                    updated_server_message: process.env.options_updated_server_message || `Server is up to date.`,
                    error_downloading_version: process.env.options_error_downloading_version || `An error occurred while downloading latest file.`,
                    deleted_oldest_version_success: process.env.options_deleted_oldest_version_success || `Oldest file has been deleted: `,
                    error_deleting_oldest_version: process.env.options_error_deleting_oldest_version || `An error occurred while deleting the oldest file.`,
                },
            };
        }
    }
    restartServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sendMessageToDiscord(this.options.strings.pre_backup_message);
                yield this.stopServer();
                yield this.startServer();
                this.sendMessageToDiscord(this.options.strings.post_backup_message);
            }
            catch (e) {
                utils_1.logging(e);
            }
            return;
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.stop_server_message);
            yield this.backupServer();
            let versionLink = yield this.checkForLatestVersion();
            yield this.getLastItemInDownload(versionLink);
            yield this.deleteOldestFile();
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `);
            this.sendMessageToDiscord(this.options.strings.start_server_message);
        });
    }
    backupServer() {
        return __awaiter(this, void 0, void 0, function* () {
            let date = new Date();
            let script = `cd ${this.options.path} && git add . && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`;
            utils_1.executeShellScript(script);
        });
    }
    checkForLatestVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let downloadURL = this.options.strings.version_download;
                const response = yield node_fetch_1.default(downloadURL);
                const html = yield response.text();
                const $ = cheerio_1.default.load(html);
                const button = $(this.options.strings.download_button);
                const buttonData = button[0];
                Object.values(buttonData);
                const versionLink = Object.values(buttonData)[3].href;
                return versionLink;
            }
            catch (err) {
                utils_1.logging('Checking for latest version', err);
            }
        });
    }
    getLastItemInDownload(versionLink) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestVersionZip = versionLink && versionLink.split('/')[versionLink.split('/').length - 1];
                let files = yield fs_1.promises.readdir(this.options.download_path);
                let lastFile = files[files.length - 1];
                if (lastFile !== latestVersionZip) {
                    this.updateServer(versionLink);
                }
                else {
                    utils_1.logging(this.options.strings.updated_server_message);
                }
            }
            catch (err) {
                utils_1.logging('Error with getting last item', err);
            }
        });
    }
    updateServer(versionLink) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestVersionZip = versionLink && versionLink.split('/')[versionLink.split('/').length - 1];
                utils_1.logging(this.options.strings.not_up_to_date_server_message + latestVersionZip);
                utils_1.executeShellScript(`cd ${this.options.download_path} && wget ${versionLink} && cd ${this.options.path} && unzip -o "${this.options.download_path}${latestVersionZip}" -x "*server.properties*" "*permissions.json*" "*whitelist.json*" "*valid_known_packs.json*"`);
            }
            catch (err) {
                utils_1.logging('Error with downloading version', this.options.strings.error_downloading_version);
                utils_1.logging('Updating server', err);
            }
        });
    }
    deleteOldestFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let files = yield fs_1.promises.readdir(this.options.download_path);
                const count = files.filter(item => item.includes('zip')).length;
                if (count > this.options.numbers.max_number_files_in_downloads_folder) {
                    let oldFile = files[1];
                    utils_1.executeShellScript(`cd ${this.options.download_path} && rm ${oldFile}`);
                    utils_1.logging(this.options.strings.deleted_oldest_version_success + oldFile);
                }
            }
            catch (err) {
                utils_1.logging('Error with deleting oldest version', this.options.strings.error_deleting_oldest_version);
                utils_1.logging('Deleting oldest files', err);
            }
        });
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.stop_server_message);
            utils_1.executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`);
            this.sendMessageToDiscord(this.options.strings.stop_server_message);
        });
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.sending_discord_message, string);
            try {
                const webhook = new discord_js_1.default.WebhookClient(this.options.discord_id, this.options.discord_token);
                yield webhook.send(`[${os_1.default.hostname()}] ${string}`);
            }
            catch (err) {
                utils_1.logging(this.options.strings.error_discord_message, err);
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
                            this.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_left_server_message);
                        }
                        else if (element.includes(this.logs_strings.player_connected)) {
                            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected);
                            this.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_join_server_message);
                        }
                    }
                    fileNumber = newFile.split(/\n/).length;
                }
            }));
        });
    }
    getGamerTagFromLog(logString, logIndentifier) {
        return logString
            .split(logIndentifier)[1]
            .split(',')[0]
            .split(' ')[1];
    }
}
exports.default = Minecraft;
//# sourceMappingURL=minecraft.js.map