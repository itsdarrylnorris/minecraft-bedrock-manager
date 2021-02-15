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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../utils");
require('dotenv').config();
class Discord {
    constructor(options) {
        const client = new discord_js_1.Client();
        client.commands = new discord_js_1.Collection();
        this.client = client;
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                discord_client: process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
                discord_role: process && process.env && process.env.DISCORD_ROLE ? process.env.DISCORD_ROLE.toString() : '',
                strings: {
                    discord_message_prefix: '/',
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
            utils_1.logging('Bot is online.');
        });
    }
    startCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('message', (message) => {
                if (!message.content.startsWith(this.options.strings.discord_message_prefix) || message.author.bot)
                    return;
                const args = message.content.slice(this.options.strings.discord_message_prefix.length).split(/ +/);
                const command = args.shift().toLowerCase();
                let author = message.author.username;
                let splitDiscordRole = this.options.discord_role.split(',');
                if (command === 'mm' &&
                    message.member.roles.cache.some((r) => splitDiscordRole.includes(r.name))) {
                    let newMessage = message.toString().replace('/', '');
                    let split = newMessage.split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitValue = split && split[1] ? split[1] : '';
                    if (splitCommand && splitValue) {
                        utils_1.logging('Command entered by:' + author, { splitCommand, splitValue });
                        message.channel.send('Sent command successfully.');
                    }
                    else if (splitCommand && !splitValue) {
                        utils_1.logging('Command entered by:' + author, { splitCommand });
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