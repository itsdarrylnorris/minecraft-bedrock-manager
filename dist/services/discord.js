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
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
const os_1 = __importDefault(require("os"));
const utils_1 = require("../utils");
require('dotenv').config();
class Discord {
    constructor(options) {
        this.discord_screen_name = 'Discord';
        const client = new discord_js_1.Client();
        client.commands = new discord_js_1.Collection();
        this.client = client;
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                path: process.env.OPTIONS_PATH || os_1.default.homedir() + '/MinecraftServer/',
                log_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/discord.log',
                whitelist_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/whitelist.json',
                old_whitelist_file: process.env.LOG_FILE || os_1.default.homedir() + '/MinecraftServer/old-whitelist.json',
                discord_client: process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
                discord_role: process && process.env && process.env.DISCORD_ROLE ? process.env.DISCORD_ROLE.toString() : '',
                discord_command: process && process.env && process.env.DISCORD_COMMAND ? process.env.DISCORD_COMMAND.toString() : '',
                discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
                discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
                strings: {
                    sending_discord_message: process.env.options_sending_discord_message || 'Sending this message to Discord.',
                    error_discord_message: process.env.options_error_discord_message || 'Something went wrong when sending the Discord message.',
                    successful_command: process.env.options_successful_command || 'Sent command successfully.',
                    error_command: process.env.options_error_command || 'There was an error when trying to execute that command.',
                    invalid_permission_command: process.env.options_invalid_permission_command || 'You are not allowed to use this command.',
                    help_command_message: process.env.options_help_command_message ||
                        'Available Commands: mbm start server, mbm stop server, mbm restart server, mbm help, mbm add [Gamertag], mbm remove [Gamertag]',
                    command_entered_message: process.env.options_command_entered_message || 'Command entered by: ',
                    successfully_added_user_message: process.env.options_successfully_added_user_message ||
                        ' has been added to the server. Restart the server to complete the adding process.',
                    successfully_removed_user_message: process.env.options_successfully_removed_user_message ||
                        ' has been removed from the server. Restart the server to complete the removal process.',
                    user_not_found: process.env.options_user_not_found || 'User cannot be found.',
                    start_command: 'start server',
                    stop_command: 'stop server',
                    restart_command: 'restart server',
                    help_command: 'help',
                    add_command: 'add',
                    remove_command: 'remove',
                },
            };
        }
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.sending_discord_message, string);
            try {
                const webhook = new discord_js_1.WebhookClient(this.options.discord_id, this.options.discord_token);
                yield webhook.send(`[${os_1.default.hostname()}] ${string}`);
            }
            catch (error) {
                utils_1.logging(this.options.strings.error_discord_message, error);
            }
        });
    }
    startDiscord() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.startBot();
                yield this.startCommands();
                yield this.loginClient();
            }
            catch (e) {
                utils_1.logging('Error with starting Discord', e);
            }
        });
    }
    startBot() {
        this.client.once('ready', () => {
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`);
            utils_1.logging('Bot is online.');
        });
    }
    startCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                if (message.author.bot)
                    return;
                const command = message.content.toLowerCase();
                let author = message.author.username;
                let splitDiscordRole = this.options.discord_role.split(',');
                if (command === `${this.options.discord_command} ${this.options.strings.start_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        utils_1.logging(this.options.strings.command_entered_message + author, command);
                        utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -s`);
                        message.channel.send(this.options.strings.successful_command);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.stop_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging(this.options.strings.command_entered_message + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -st`);
                    try {
                        message.channel.send(this.options.strings.successful_command);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.restart_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging(this.options.strings.command_entered_message + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -r`);
                    try {
                        message.channel.send(this.options.strings.successful_command);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.help_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        message.channel.send(this.options.strings.help_command_message);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command.includes(this.options.discord_command && this.options.strings.add_command) &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    let split = message.toString().split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitAdd = split && split[1] ? split[1] : '';
                    let splitUser = split && split[2] ? split[2] : '';
                    if (splitCommand && splitAdd && splitUser) {
                        utils_1.logging(this.options.strings.command_entered_message + author, message.content);
                        try {
                            let date = new Date();
                            utils_1.executeShellScript(`cd ${this.options.path} && git add ${this.options.whitelist_file} && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`);
                            let files = yield promises_1.readdir(this.options.path);
                            if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
                                utils_1.executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`);
                            }
                            utils_1.executeShellScript(`cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`);
                            let whitelistTable = [{}];
                            let whitelistFile = this.options.whitelist_file;
                            let ignoresPlayerLimit = false;
                            let name = splitUser;
                            let xuid = '2535428286950419';
                            fs_1.default.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(error, data) {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    whitelistTable = JSON.parse(data);
                                    whitelistTable.push({ ignoresPlayerLimit, name, xuid });
                                    addUser(whitelistTable);
                                }
                            });
                            const addUser = (whitelistTable) => {
                                let whitelistJSON = JSON.stringify(whitelistTable);
                                fs_1.default.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
                                    if (error) {
                                        throw error;
                                    }
                                });
                                message.channel.send(splitUser + this.options.strings.successfully_added_user_message);
                            };
                        }
                        catch (error) {
                            utils_1.logging(error);
                            message.channel.send(this.options.strings.error_command);
                        }
                    }
                    else {
                        utils_1.logging(author + ' ' + this.options.strings.error_command);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command.includes(this.options.discord_command && this.options.strings.remove_command) &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    let split = message.toString().split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitRemove = split && split[1] ? split[1] : '';
                    let splitUser = split && split[2] ? split[2] : '';
                    if (splitCommand && splitRemove && splitUser) {
                        utils_1.logging(this.options.strings.command_entered_message + author, message.content);
                        try {
                            let date = new Date();
                            utils_1.executeShellScript(`cd ${this.options.path} && git add ${this.options.whitelist_file} && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`);
                            let files = yield promises_1.readdir(this.options.path);
                            if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
                                utils_1.executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`);
                            }
                            utils_1.executeShellScript(`cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`);
                            let whitelistFile = this.options.whitelist_file;
                            let userNames = [];
                            fs_1.default.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(error, data) {
                                if (error) {
                                    utils_1.logging(this.options.strings.error_with_reading_file, error);
                                }
                                else {
                                    let whitelistData = JSON.parse(data);
                                    whitelistData.forEach(function (whitelistData) {
                                        userNames.push(whitelistData.name);
                                    });
                                    removeUser(whitelistData);
                                }
                            });
                            const removeUser = (whitelistData) => {
                                if (userNames.includes(splitUser)) {
                                    let updatedData = whitelistData.filter((whitelistData) => whitelistData.name !== splitUser);
                                    let whitelistJSON = JSON.stringify(updatedData);
                                    fs_1.default.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
                                        if (error) {
                                            message.channel.send(this.options.strings.error_command);
                                            throw error;
                                        }
                                    });
                                    message.channel.send(splitUser + this.options.strings.successfully_removed_user_message);
                                }
                                else {
                                    message.channel.send(this.options.strings.user_not_found);
                                }
                            };
                        }
                        catch (error) {
                            utils_1.logging(error);
                            message.channel.send(this.options.strings.error_command);
                        }
                    }
                    else {
                        utils_1.logging(author + ' ' + this.options.strings.error_command);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else {
                    message.reply(this.options.strings.invalid_permission_command);
                }
            }));
        });
    }
    loginClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.login(this.options.discord_client);
        });
    }
}
exports.default = Discord;
//# sourceMappingURL=discord.js.map