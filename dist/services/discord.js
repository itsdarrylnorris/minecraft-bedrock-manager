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
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
const os_1 = __importDefault(require("os"));
const utils_1 = require("../utils");
const minecraft_1 = __importDefault(require("./minecraft"));
const { Client, Collection, Intents, WebhookClient, WebhookInterface, Message } = require('discord.js');
require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
class Discord {
    constructor(options) {
        this.discord_screen_name = 'Discord';
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
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
                client_id: process && process.env && process.env.CLIENT_ID ? process.env.CLIENT_ID.toString() : '',
                strings: {
                    error_starting_discord_message: process.env.options_error_starting_discord_message || 'Could not start Discord Bot.',
                    bot_is_online_message: process.env.options_bot_is_online_message || 'Bot is online!',
                    sending_discord_message: process.env.options_sending_discord_message || 'Sending this interaction to Discord.',
                    error_discord_message: process.env.options_error_discord_message || 'Something went wrong when sending the Discord interaction.',
                    successful_command_message: process.env.options_successful_command_message || 'Sent command successfully.',
                    error_command: process.env.options_error_command || 'There was an error when trying to execute that command.',
                    invalid_permission_command: process.env.options_invalid_permission_command || 'You are not allowed to use this command.',
                    command_entered_message: process.env.options_command_entered_message || 'Command entered by: ',
                    successfully_added_user_message: process.env.options_successfully_added_user_message ||
                        ' has been added to the server. Restart the server to complete the adding process.',
                    successfully_removed_user_message: process.env.options_successfully_removed_user_message ||
                        ' has been removed from the server. Restart the server to complete the removal process.',
                    user_not_found_message: process.env.options_user_not_found_message || 'User cannot be found.',
                    xuid_not_found_message: process.env.options_xuid_not_found_message || 'Could not find gamertag xuid',
                    start_command: process.env.options_start_command || 'start',
                    stop_command: process.env.options_stop_command || 'stop',
                    restart_command: process.env.options_restart_command || 'restart',
                    help_command: process.env.options_help_command || 'help',
                    add_command: process.env.options_add_command || 'add',
                    remove_command: process.env.options_remove_command || 'remove',
                    start_command_description: process.env.options_start_command_description || 'Starts up the server.',
                    stop_command_description: process.env.options_stop_command_description || 'Stops up the server.',
                    restart_command_description: process.env.options_restart_command_description || 'Restarts up the server.',
                    help_command_description: process.env.options_help_command_description || 'Replies with available Help Commands.',
                    successfully_deployed_commands: process.env.options_successfully_deployed_commands || 'Successfully registered application commands.',
                    error_with_deploying_commands: process.env.options_error_with_deploying_commands || 'Error occurred while deploying commands:',
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
                yield this.startInteractions();
                yield this.loginClient();
            }
            catch (error) {
                utils_1.logging(this.options.strings.error_starting_discord_message, error);
            }
        });
    }
    deployCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.deploy();
            }
            catch (error) {
                utils_1.logging(this.options.strings.error_starting_discord_message, error);
            }
        });
    }
    startBot() {
        this.client.on('ready', () => {
            utils_1.executeShellScript(`cd ${this.options.path} && screen -L -Logfile discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`);
            this.client.user.setActivity('activity', { type: 'WATCHING' });
            utils_1.logging(this.options.strings.bot_is_online_message);
        });
    }
    startMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
                if (message.author.bot)
                    return;
                const command = message.content.toLowerCase();
                if (command.includes(this.options.discord_command && this.options.strings.add_command) &&
                    message.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + message.author.username, message.content);
                    let split = message.toString().split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitAdd = split && split[1] ? split[1] : '';
                    let splitUser = split && split[2] ? split[2] : '';
                    console.log(split, splitCommand, splitAdd, splitUser);
                    if (splitCommand && splitAdd && splitUser) {
                        try {
                            let date = new Date();
                            utils_1.executeShellScript(`cd ${this.options.path} && git add ${this.options.whitelist_file} && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`);
                            utils_1.logging('Could not add xuid to whitelist', date);
                            let files = yield promises_1.readdir(this.options.path);
                            if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
                                utils_1.executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`);
                            }
                            utils_1.executeShellScript(`cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`);
                            let whitelistTable = [{}];
                            let whitelistFile = this.options.whitelist_file;
                            let ignoresPlayerLimit = false;
                            let name = splitUser;
                            const minecraft = new minecraft_1.default();
                            let xuid = yield minecraft.getXuidFromGamerTag(name);
                            const readFile = () => {
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
                            };
                            if (xuid !== '') {
                                readFile();
                            }
                            else {
                                message.channel.send(this.options.strings.xuid_not_found_message);
                            }
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
                            utils_1.logging('Could not add xuid to whitelist', error);
                            message.channel.send(this.options.strings.error_command);
                        }
                    }
                    else {
                        utils_1.logging(this.options.strings.error_command);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
                else if (command.includes(this.options.discord_command && this.options.strings.remove_command) &&
                    message.member.roles.cache.some((role) => role.name === this.options.discord_role)) {
                    utils_1.logging(this.options.strings.command_entered_message + message.author.username, message.content);
                    let split = message.toString().split(' ');
                    let splitCommand = split && split[0] ? split[0] : '';
                    let splitRemove = split && split[1] ? split[1] : '';
                    let splitUser = split && split[2] ? split[2] : '';
                    if (splitCommand && splitRemove && splitUser) {
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
                                if (!userNames.includes(splitUser)) {
                                    message.channel.send(this.options.strings.user_not_found_message);
                                }
                                else {
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
                            };
                        }
                        catch (error) {
                            utils_1.logging('Could not remove xuid from whitelist', error);
                            message.channel.send(this.options.strings.error_command);
                        }
                    }
                    else {
                        utils_1.logging(this.options.strings.error_command);
                        message.channel.send(this.options.strings.error_command);
                    }
                }
            }));
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
                        interaction.reply('**Available Commands:** \n' +
                            '-  /' +
                            this.options.strings.start_command +
                            '\n' +
                            '-  /' +
                            this.options.strings.stop_command +
                            '\n' +
                            '-  /' +
                            this.options.strings.restart_command +
                            '\n' +
                            '-  /' +
                            this.options.strings.help_command +
                            '\n' +
                            '- ' +
                            this.options.discord_command +
                            ' ' +
                            this.options.strings.add_command +
                            ' [Gamertag]' +
                            '\n' +
                            '- ' +
                            this.options.discord_command +
                            ' ' +
                            this.options.strings.remove_command +
                            ' [Gamertag]');
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
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [
                new SlashCommandBuilder()
                    .setName(this.options.strings.start_command)
                    .setDescription(this.options.strings.start_command_description),
                new SlashCommandBuilder()
                    .setName(this.options.strings.stop_command)
                    .setDescription(this.options.strings.stop_command_description),
                new SlashCommandBuilder()
                    .setName(this.options.strings.restart_command)
                    .setDescription(this.options.strings.restart_command_description),
                new SlashCommandBuilder()
                    .setName(this.options.strings.help_command)
                    .setDescription(this.options.strings.help_command_description),
            ].map((command) => command.toJSON());
            const rest = new REST({ version: '9' }).setToken(this.options.discord_token);
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield rest.put(Routes.applicationGuildCommands(this.options.client_id, this.options.discord_id), {
                        body: commands,
                    });
                    utils_1.logging(this.options.strings.successfully_deployed_commands);
                }
                catch (error) {
                    utils_1.logging(this.options.strings.error_with_deploying_commands, error);
                }
            }))();
        });
    }
}
exports.default = Discord;
//# sourceMappingURL=discord.js.map