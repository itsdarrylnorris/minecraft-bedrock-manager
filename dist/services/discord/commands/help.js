"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpCommand = void 0;
const { SlashCommandBuilder } = require('@discordjs/builders');
const index_1 = __importDefault(require("../../discord/index"));
const helpCommand = () => {
    var discord = new index_1.default({});
    let darryl = new SlashCommandBuilder()
        .setName(discord.options.strings.help_command)
        .setDescription('Replies with available Help Commands.');
    console.log(darryl);
    return darryl;
};
exports.helpCommand = helpCommand;
//# sourceMappingURL=help.js.map