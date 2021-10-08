import Discord from '.'
export {}
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()
const { SlashCommandBuilder } = require('@discordjs/builders')

let discord = new Discord()

const client_id = process && process.env && process.env.CLIENT_ID ? process.env.CLIENT_ID.toString() : ''
const discord_id = process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : ''
const discord_token = process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : ''

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
].map((command) => command.toJSON())

const rest = new REST({ version: '9' }).setToken(discord_token)

;(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(client_id, discord_id), { body: commands })

    console.log('Successfully registered application commands.')
  } catch (error) {
    console.error(error)
  }
})()
