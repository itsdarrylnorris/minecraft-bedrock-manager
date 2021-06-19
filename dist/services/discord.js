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
                discord_client: process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
                discord_role: process && process.env && process.env.DISCORD_ROLE ? process.env.DISCORD_ROLE.toString() : '',
                discord_command: process && process.env && process.env.DISCORD_COMMAND ? process.env.DISCORD_COMMAND.toString() : '',
                discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
                discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
                sending_discord_message: process.env.options_sending_discord_message || 'Sending this message to Discord.',
                error_discord_message: process.env.options_error_discord_message || 'Something went wrong when sending the Discord message.',
                successful_command: process.env.options_successful_command || 'Sent command successfully.',
                error_command: process.env.options_error_command || 'There was an error when trying to execute that command.',
                invalid_permission_command: process.env.options_invalid_permission_command || 'You are not allowed to use this command.',
                strings: {
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
            catch (err) {
                utils_1.logging(this.options.strings.error_discord_message, err);
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
                utils_1.logging('Error Start Discord', e);
            }
        });
    }
    startBot() {
        this.client.once('ready', () => {
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server"`);
            utils_1.logging('Bot is online.');
        });
    }
    startCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('message', (message) => {
                const command = message.content.toLowerCase();
                let author = message.author.username;
                let splitDiscordRole = this.options.discord_role.split(',');
                if (command === `${this.options.discord_command} ${this.options.strings.start_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        utils_1.logging('Command entered by: ' + author, command);
                        utils_1.executeShellScript(`cd ${this.options.path} && mbm -s`);
                        message.channel.send('Sent command successfully.');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.stop_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging('Command entered by: ' + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && mbm -st`);
                    try {
                        message.channel.send(this.options.successful_command);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.restart_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging('Command entered by: ' + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && mbm -r`);
                    try {
                        message.channel.send(this.options.successful_command);
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.help_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        message.channel.send('Available Commands: mbm start server, mbm stop server, mbm restart server, mbm help, mbm add [Gamertag], mbm remove [Gamertag]');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send(this.options.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.add_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging(command);
                    let split = message.toString().split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitValue = split && split[1] ? split[1] : '';
                    if (splitCommand && splitValue) {
                        utils_1.logging('Command entered by: ' + author, { splitCommand, splitValue });
                        message.channel.send(this.options.successful_command);
                    }
                    else if (splitCommand && !splitValue) {
                        utils_1.logging('Command entered by: ' + author, { splitCommand });
                        message.channel.send(this.options.successful_command);
                    }
                    else {
                        utils_1.logging(author + this.options.error_command);
                        message.channel.send(this.options.error_command);
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.remove_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging(command);
                    let newMessage = message.toString().replace('/', '');
                    let split = newMessage.split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitValue = split && split[1] ? split[1] : '';
                    if (splitCommand && splitValue) {
                        utils_1.logging('Command entered by: ' + author, { splitCommand, splitValue });
                        message.channel.send(this.options.successful_command);
                    }
                    else if (splitCommand && !splitValue) {
                        utils_1.logging('Command entered by: r' + author, { splitCommand });
                        message.channel.send(this.options.successful_command);
                    }
                    else {
                        utils_1.logging(author + this.options.error_command);
                        message.channel.send(this.options.error_command);
                    }
                }
                else {
                    message.reply(this.options.invalid_permission_command);
                }
            });
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