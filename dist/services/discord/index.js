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
const os_1 = __importDefault(require("os"));
const utils_1 = require("../../utils");
const { Client, Collection, Intents, WebhookClient, WebhookInterface } = require('discord.js');
require('dotenv').config();
class Discord {
    constructor(options) {
        this.discord_screen_name = 'Discord';
        const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
        client.commands = new Collection();
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
                    error_starting_discord_message: process.env.options_error_starting_discord_message || 'Could not start Discord Bot.',
                    bot_is_online_message: process.env.options_bot_is_online_message || 'Bot is online!',
                    sending_discord_message: process.env.options_sending_discord_message || 'Sending this interaction to Discord.',
                    error_discord_message: process.env.options_error_discord_message || 'Something went wrong when sending the Discord interaction.',
                    successful_command_message: process.env.options_successful_command_message || 'Sent command successfully.',
                    error_command: process.env.options_error_command || 'There was an error when trying to execute that command.',
                    invalid_permission_command: process.env.options_invalid_permission_command || 'You are not allowed to use this command.',
                    help_command_message: process.env.options_help_command_message ||
                        'Available Commands: /start server, /stop server, /restart server, /help, /add [Gamertag], /remove [Gamertag]',
                    command_entered_message: process.env.options_command_entered_message || 'Command entered by: ',
                    successfully_added_user_message: process.env.options_successfully_added_user_message ||
                        ' has been added to the server. Restart the server to complete the adding process.',
                    successfully_removed_user_message: process.env.options_successfully_removed_user_message ||
                        ' has been removed from the server. Restart the server to complete the removal process.',
                    user_not_found_message: process.env.options_user_not_found_message || 'User cannot be found.',
                    xuid_not_found_message: process.env.options_xuid_not_found_message || 'Could not find gamertag xuid',
                    start_command: 'start',
                    stop_command: 'stop',
                    restart_command: 'restart',
                    help_command: 'help',
                    add_command: 'add',
                    remove_command: 'remove',
                    start_command_description: 'Starts up the server.',
                    stop_command_description: 'Stops up the server.',
                    restart_command_description: 'Restarts up the server.',
                    help_command_description: 'Replies with available Help Commands.',
                    add_command_description: 'Finds user XUID and adds user to the server.',
                    remove_command_description: 'Removes the user from the server.',
                },
            };
        }
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logging(this.options.strings.sending_discord_message, string);
            try {
                const webhook = new WebhookClient(this.options.discord_id, this.options.discord_token);
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
                yield this.startMessages();
                console.log('pass');
                yield this.startInteractions();
                yield this.loginClient();
            }
            catch (error) {
                utils_1.logging(this.options.strings.error_starting_discord_message, error);
            }
        });
    }
    startBot() {
        this.client.once('ready', () => {
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`);
            this.client.user.setActivity('activity', { type: 'WATCHING' });
            utils_1.logging(this.options.strings.bot_is_online_message);
        });
    }
    startMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            let prefix = '/';
            this.client.on('messageCreate', (message) => {
                if (!message.content.startsWith(prefix) || message.author.bot)
                    return;
                const command = message.content.toLowerCase();
                console.log(command);
            });
        });
    }
    startInteractions() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.isCommand())
                    return;
                const { commandName } = interaction;
                if (commandName === this.options.strings.start_command &&
                    interaction.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + interaction.user.username, commandName);
                    try {
                        utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -s`);
                        interaction.reply(this.options.strings.successful_command_message);
                    }
                    catch (error) {
                        utils_1.logging('Could not execute start command', error);
                        interaction.reply(this.options.strings.error_command);
                    }
                }
                else if (commandName === this.options.strings.stop_command &&
                    interaction.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + interaction.user.username, commandName);
                    try {
                        utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -st`);
                        interaction.reply(this.options.strings.successful_command_message);
                    }
                    catch (error) {
                        utils_1.logging('Could not execute help command', error);
                        interaction.reply(this.options.strings.error_command);
                    }
                }
                else if (commandName === this.options.strings.restart_command &&
                    interaction.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + interaction.user.username, commandName);
                    try {
                        utils_1.executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -r`);
                        interaction.reply(this.options.strings.successful_command_message);
                    }
                    catch (error) {
                        utils_1.logging('Could not execute help command', error);
                        interaction.reply(this.options.strings.error_command);
                    }
                }
                else if (commandName === this.options.strings.help_command &&
                    interaction.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + interaction.user.username, commandName);
                    try {
                        interaction.reply(this.options.strings.help_command_message);
                    }
                    catch (error) {
                        utils_1.logging('Could not execute help command', error);
                        interaction.reply(this.options.strings.error_command);
                    }
                }
                else {
                    interaction.reply(this.options.strings.invalid_permission_command);
                }
            }));
        });
    }
    loginClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.login(this.options.discord_token);
        });
    }
}
exports.default = Discord;
//# sourceMappingURL=index.js.map