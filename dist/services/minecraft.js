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
const fs_1 = require("fs");
const os_1 = __importDefault(require("os"));
const utils_1 = require("../utils");
const discord_1 = __importDefault(require("./discord"));
require('dotenv').config();
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const cheerio_1 = __importDefault(require("cheerio"));
class Minecraft {
    constructor(options) {
        this.logs_strings = {
            player_disconnected: '[INFO] Player disconnected:',
            player_connected: '[INFO] Player connected:',
        };
        this.minecraft_screen_name = 'Minecraft';
        this.discord_screen_name = 'Discord';
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                path: process.env.OPTIONS_PATH || os_1.default.homedir() + '/MinecraftServer/',
                backup_path: process.env.BACKUP_PATH || os_1.default.homedir() + '/Backups/',
                download_path: process.env.DOWNLOAD_PATH || os_1.default.homedir() + '/downloads/',
                log_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/minecraft-server.log',
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
                    gamertag_join_server_message: process.env.options_gamertag_join_server_message || 'joined the Minecraft server.',
                    gamertag_left_server_message: process.env.options_gamertag_left_server_message || 'left the Minecraft server.',
                    version_download: process.env.options_versions_downloads || 'https://www.minecraft.net/en-us/download/server/bedrock/',
                    xuid_download: process.env.xuid_download || 'https://cxkes.me/xbox/xuid',
                    download_button: process.env.options_download_button || '[data-platform="serverBedrockLinux"]',
                    xuid_string: process.env.xuid_string || '.col-md-8 div h1',
                    not_up_to_date_server_message: process.env.options_not_up_to_date_server_message ||
                        `Server is not up to date. Updating server to latest version: `,
                    updated_server_message: process.env.options_updated_server_message || `Server is up to date.`,
                    error_downloading_version_message: process.env.options_error_downloading_version_message || `An error occurred while downloading latest file.`,
                    deleted_oldest_version_success_message: process.env.options_deleted_oldest_version_success_message || `Oldest file has been deleted: `,
                    error_deleting_oldest_version_message: process.env.options_error_deleting_oldest_version_message ||
                        `An error occurred while deleting the oldest file.`,
                },
            };
        }
        this.discord_instance = new discord_1.default({});
    }
    restartServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.discord_instance.sendMessageToDiscord(this.options.strings.pre_backup_message);
                yield this.stopServer();
                yield this.startServer();
                this.discord_instance.sendMessageToDiscord(this.options.strings.post_backup_message);
            }
            catch (error) {
                utils_1.logging(error);
            }
            return;
        });
    }
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.stop_server_message);
            this.backupServer();
            let versionLink = yield this.checkForLatestVersion();
            if (versionLink) {
                yield this.getLastItemInDownload(versionLink);
                yield this.deleteOldestFile();
            }
            else {
                utils_1.logging('Could not find the latest version from the website.');
            }
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `);
            this.discord_instance.sendMessageToDiscord(this.options.strings.start_server_message);
        });
    }
    backupServer() {
        let date = new Date();
        let script = `cd ${this.options.path} && git add . && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`;
        utils_1.executeShellScript(script);
    }
    checkForLatestVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                utils_1.logging('Checking for latest version');
                let downloadURL = this.options.strings.version_download;
                const browser = yield puppeteer_extra_1.default.use(puppeteer_extra_plugin_stealth_1.default()).launch({
                    args: ['--no-sandbox'],
                    executablePath: '/usr/bin/chromium-browser',
                });
                const page = yield browser.newPage();
                yield page.goto(downloadURL);
                const html = yield page.content();
                const $ = cheerio_1.default.load(html);
                const button = $(this.options.strings.download_button);
                const buttonData = button[0];
                yield browser.close();
                return Object.values(buttonData)[3].href || '';
            }
            catch (error) {
                utils_1.logging('Error while checking for latest version', error);
            }
            return '';
        });
    }
    getXuidFromGamerTag(gamerTag = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                utils_1.logging('Looking for xuid');
                let downloadURL = this.options.strings.xuid_download;
                const browser = yield puppeteer_extra_1.default
                    .use(puppeteer_extra_plugin_stealth_1.default())
                    .launch({ args: ['--no-sandbox'], executablePath: '/usr/bin/chromium-browser' });
                const page = yield browser.newPage();
                yield page.goto(downloadURL);
                yield page.click('.form-check-input[value="1"]');
                yield page.focus('#gamertag');
                yield page.keyboard.type(gamerTag);
                yield Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
                const html = yield page.content();
                const $ = cheerio_1.default.load(html);
                const xuidPayload = $(this.options.strings.xuid_string);
                const xuidString = xuidPayload[0].children[0].data;
                if (xuidString) {
                    utils_1.logging(`Found xuid from gamertag. Gamertag: ${gamerTag}, xuid: ${xuidString}`);
                }
                yield browser.close();
                return xuidString;
            }
            catch (error) {
                utils_1.logging('Error while looking for xuid', error);
            }
            return '';
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
            catch (error) {
                utils_1.logging('Error with getting last item', error);
            }
        });
    }
    updateServer(versionLink) {
        try {
            const latestVersionZip = versionLink && versionLink.split('/')[versionLink.split('/').length - 1];
            utils_1.logging(this.options.strings.not_up_to_date_server_message + latestVersionZip);
            utils_1.executeShellScript(`cd ${this.options.download_path} && ` +
                `wget ${versionLink} && ` +
                `cd ${this.options.path} && ` +
                `unzip -o "${this.options.download_path}${latestVersionZip}" -x "*server.properties*" "*permissions.json*" "*whitelist.json*" "*valid_known_packs.json*" && ` +
                `chmod 777 ${this.options.path}/bedrock_server`);
        }
        catch (error) {
            utils_1.logging('Error with downloading version', this.options.strings.error_downloading_version_message);
            utils_1.logging('Updating server', error);
        }
    }
    deleteOldestFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let files = yield fs_1.promises.readdir(this.options.download_path);
                const count = files.filter((item) => item.includes('zip')).length;
                if (count > this.options.numbers.max_number_files_in_downloads_folder) {
                    let oldFile = files[1];
                    utils_1.executeShellScript(`cd ${this.options.download_path} && rm ${oldFile}`);
                    utils_1.logging(this.options.strings.deleted_oldest_version_success_message + oldFile);
                }
            }
            catch (error) {
                utils_1.logging('Error with deleting oldest version', this.options.strings.error_deleting_oldest_version_message);
                utils_1.logging('Deleting oldest files', error);
            }
        });
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.stop_server_message);
            utils_1.executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`);
            this.discord_instance.sendMessageToDiscord(this.options.strings.stop_server_message);
        });
    }
    logs() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile minecraft-discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`);
            utils_1.logging('Watching for changes');
            let file = yield fs_1.promises.readFile(this.options.log_file, 'utf8');
            let fileNumber = file.split(/\n/).length;
            chokidar_1.default.watch(this.options.log_file).on('all', (evt, path) => __awaiter(this, void 0, void 0, function* () {
                if (evt === 'change') {
                    let newFile = yield fs_1.promises.readFile(path, 'utf8');
                    let newFileNumber = newFile.split(/\n/).length;
                    if (fileNumber < newFileNumber) {
                        const element = newFile.split(/\n/)[newFileNumber - 2];
                        if (element.includes(this.logs_strings.player_disconnected)) {
                            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_disconnected);
                            this.discord_instance.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_left_server_message);
                        }
                        else if (element.includes(this.logs_strings.player_connected)) {
                            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected);
                            this.discord_instance.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_join_server_message);
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