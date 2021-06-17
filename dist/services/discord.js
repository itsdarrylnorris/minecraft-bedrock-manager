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
                discord_message_prefix: process && process.env && process.env.DISCORD_PREFIX ? process.env.DISCORD_PREFIX.toString() : '',
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
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.discord_screen_name}`);
            utils_1.logging('Bot is online.');
        });
    }
    startCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('message', (message) => {
                if (!message.content.startsWith(this.options.discord_message_prefix) || message.author.bot)
                    return;
                const args = message.content.slice(this.options.discord_message_prefix.length);
                const command = args.toLowerCase();
                let author = message.author.username;
                let splitDiscordRole = this.options.discord_role.split(',');
                if (command === `${this.options.discord_command} ${this.options.strings.start_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        utils_1.logging('Command entered by: ' + author, command);
                        utils_1.executeShellScript(`cd ${this.options.path} && mm -s`);
                        message.channel.send('Sent command successfully.');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send('There was an error when trying to execute that command!');
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.stop_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging('Command entered by: ' + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && mm -st`);
                    try {
                        message.channel.send('Sent command successfully.');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send('There was an error when trying to execute that command!');
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.restart_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging('Command entered by: ' + author, command);
                    utils_1.executeShellScript(`cd ${this.options.path} && mm -r`);
                    try {
                        message.channel.send('Sent command successfully.');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send('There was an error when trying to execute that command!');
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.help_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    try {
                        message.channel.send('Available Commands: /mm start server, /mm stop server, /mm restart server, /mm help, /mm add [Gamertag], /mm remove [Gamertag]');
                    }
                    catch (error) {
                        utils_1.logging(error);
                        message.channel.send('There was an error when trying to execute that command!');
                    }
                }
                else if (command === `${this.options.discord_command} ${this.options.strings.add_command}` &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    utils_1.logging(command);
                    let newMessage = message.toString().replace('/', '');
                    let split = newMessage.split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitValue = split && split[1] ? split[1] : '';
                    if (splitCommand && splitValue) {
                        utils_1.logging('Command entered by: ' + author, { splitCommand, splitValue });
                        message.channel.send('Sent command successfully.');
                    }
                    else if (splitCommand && !splitValue) {
                        utils_1.logging('Command entered by: ' + author, { splitCommand });
                        message.channel.send('Sent command successfully.');
                    }
                    else {
                        utils_1.logging(author + 'There was an error when trying to execute that command!');
                        message.channel.send('There was an error when trying to execute that command!');
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
                        message.channel.send('Sent command successfully.');
                    }
                    else if (splitCommand && !splitValue) {
                        utils_1.logging('Command entered by: r' + author, { splitCommand });
                        message.channel.send('Sent command successfully.');
                    }
                    else {
                        utils_1.logging(author + 'There was an error when trying to execute that command!');
                        message.channel.send('There was an error when trying to execute that command!');
                    }
                }
                else {
                    message.reply('You are not allowed to use this command.');
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