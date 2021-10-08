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
const _1 = __importDefault(require("."));
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
let discord = new _1.default();
const client_id = process && process.env && process.env.CLIENT_ID ? process.env.CLIENT_ID.toString() : '';
const discord_id = process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '';
const discord_token = process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '';
const commands = [
    new SlashCommandBuilder()
        .setName(discord.options.strings.start_command)
        .setDescription(discord.options.strings.start_command_description),
    new SlashCommandBuilder()
        .setName(discord.options.strings.stop_command)
        .setDescription(discord.options.strings.stop_command_description),
    new SlashCommandBuilder()
        .setName(discord.options.strings.restart_command)
        .setDescription(discord.options.strings.restart_command_description),
    new SlashCommandBuilder()
        .setName(discord.options.strings.help_command)
        .setDescription(discord.options.strings.help_command_description),
].map((command) => command.toJSON());
const rest = new REST({ version: '9' }).setToken(discord_token);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield rest.put(Routes.applicationGuildCommands(client_id, discord_id), { body: commands });
        console.log('Successfully registered application commands.');
    }
    catch (error) {
        console.error(error);
    }
}))();
//# sourceMappingURL=deploy-commands.js.map