import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Client, Collection, Intents, Message, Snowflake, WebhookClient } from 'discord.js'
import dotenv from 'dotenv'
import EventEmitter from 'events'
import fs, { PathLike } from 'fs'
import { readdir } from 'fs/promises'
import os from 'os'
import { executeShellScript, logging } from '../utils'
import Minecraft from './minecraft'
dotenv.config()

/**
 * Discord Interface.
 */
interface DiscordOptionsInterface {
  // Path location of all files
  path: PathLike

  // Minecraft log file
  log_file: string | undefined

  // Path location of whitelist.json file
  whitelist_file: string

  // Path location of old-whitelist.json file
  old_whitelist_file: string

  // Discord Client
  discord_client: string | undefined

  // Roles that are allowed to use the Discord commands
  discord_role: string | undefined

  // Phrase that starts the Discord command
  discord_command: string | undefined

  // Discord Id
  discord_id: Snowflake | undefined

  // Discord Token
  discord_token: string | undefined

  // Client Id
  client_id: string | undefined

  // Strings that are used to post
  strings: DiscordStringsInterface
}

/**
 * Webhook Interface.
 */
interface WebhookInterface {
  send: any
}

/**
 * Client Interface.
 */
interface ClientInterface {
  on: any
  user: any
  commands?: string
  login: any
  client?: EventEmitter
}

/**
 * Editable configuration for strings.
 */
interface DiscordStringsInterface {
  error_starting_discord_message: string
  bot_is_online_message: string
  sending_discord_message: string
  error_discord_message: string
  error_command: string
  successful_command_message: string
  invalid_permission_command: string
  command_entered_message: string
  successfully_added_user_message: string
  successfully_removed_user_message: string
  user_not_found_message: string
  xuid_not_found_message: string
  error_with_adding_xuid_to_whitelist: string
  error_with_removing_xuid_from_whitelist: string
  error_with_start_command: string
  error_with_stop_command: string
  error_with_restart_command: string
  error_with_help_command: string
  start_command: string
  stop_command: string
  restart_command: string
  help_command: string
  add_command: string
  remove_command: string
  start_command_description: string
  stop_command_description: string
  restart_command_description: string
  help_command_description: string
  successfully_deployed_commands: string
  error_with_deploying_commands: string
}

/**
 * Discord.
 *
 */
class Discord {
  // Options configuration
  options: DiscordOptionsInterface

  client: ClientInterface

  private discord_screen_name: string = 'Discord'

  /**
   * Constructor
   * @param options
   */
  constructor(options?: DiscordOptionsInterface) {
    // Create a new client instance
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
    client.commands = new Collection()
    this.client = client
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.OPTIONS_PATH || os.homedir() + '/MinecraftServer/',
        log_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/discord.log',
        whitelist_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/whitelist.json',
        old_whitelist_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/old-whitelist.json',
        discord_client:
          process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
        discord_role: process && process.env && process.env.DISCORD_ROLE ? process.env.DISCORD_ROLE.toString() : '',
        discord_command:
          process && process.env && process.env.DISCORD_COMMAND ? process.env.DISCORD_COMMAND.toString() : '',
        discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
        client_id: process && process.env && process.env.CLIENT_ID ? process.env.CLIENT_ID.toString() : '',
        strings: {
          error_starting_discord_message:
            process.env.options_error_starting_discord_message || 'Could not start Discord Bot.',
          bot_is_online_message: process.env.options_bot_is_online_message || 'Bot is online!',
          sending_discord_message:
            process.env.options_sending_discord_message || 'Sending this interaction to Discord.',
          error_discord_message:
            process.env.options_error_discord_message || 'Something went wrong when sending the Discord interaction.',
          successful_command_message: process.env.options_successful_command_message || 'Sent command successfully.',
          error_command: process.env.options_error_command || 'There was an error when trying to execute that command.',
          invalid_permission_command:
            process.env.options_invalid_permission_command || 'You are not allowed to use this command.',

          command_entered_message: process.env.options_command_entered_message || 'Command entered by: ',
          successfully_added_user_message:
            process.env.options_successfully_added_user_message ||
            ' has been added to the server. Restart the server to complete the adding process.',
          successfully_removed_user_message:
            process.env.options_successfully_removed_user_message ||
            ' has been removed from the server. Restart the server to complete the removal process.',
          user_not_found_message: process.env.options_user_not_found_message || 'User cannot be found.',
          xuid_not_found_message: process.env.options_xuid_not_found_message || 'Could not find gamertag xuid.',
          error_with_adding_xuid_to_whitelist:
            process.env.options_error_with_adding_xuid_to_whitelist || 'Could not add xuid to whitelist file.',
          error_with_removing_xuid_from_whitelist:
            process.env.options_error_with_removing_xuid_from_whitelist || 'Could not remove xuid from whitelist file.',
          error_with_start_command: process.env.options_error_with_start_command || 'Could not execute Start command.',
          error_with_stop_command: process.env.options_error_with_stop_command || 'Could not execute Stop command.',
          error_with_restart_command:
            process.env.options_error_with_restart_command || 'Could not execute Restart command.',
          error_with_help_command: process.env.options_error_with_help_command || 'Could not execute Help command.',
          start_command: process.env.options_start_command || 'start',
          stop_command: process.env.options_stop_command || 'stop',
          restart_command: process.env.options_restart_command || 'restart',
          help_command: process.env.options_help_command || 'help',
          add_command: process.env.options_add_command || 'add',
          remove_command: process.env.options_remove_command || 'remove',
          start_command_description: process.env.options_start_command_description || 'Starts up the server.',
          stop_command_description: process.env.options_stop_command_description || 'Stops up the server.',
          restart_command_description: process.env.options_restart_command_description || 'Restarts up the server.',
          help_command_description:
            process.env.options_help_command_description || 'Replies with available Help Commands.',
          successfully_deployed_commands:
            process.env.options_successfully_deployed_commands || 'Successfully registered application commands.',
          error_with_deploying_commands:
            process.env.options_error_with_deploying_commands || 'Error occurred while deploying commands.',
        },
      }
    }
  }

  /**
   * Sends a interaction to Discord.
   *
   * @param string String interaction for Discord.
   */
  async sendMessageToDiscord(string: string): Promise<void> {
    logging(this.options.strings.sending_discord_message, string)
    try {
      if (this.options.discord_id && this.options.discord_token) {
        const webhook: WebhookInterface = new WebhookClient({
          id: this.options.discord_id,
          token: this.options.discord_token,
        })
        await webhook.send(`[${os.hostname()}] ${string}`)
      } else {
        throw new Error(
          `Missing discord config. Discord ID: ${this.options.discord_id}, Discord Token: ${this.options.discord_token}`,
        )
      }
    } catch (error) {
      logging(this.options.strings.error_discord_message, error)
    }
  }

  /**
   * Starts Discord.
   *
   */
  async startDiscord() {
    try {
      // Wakes up Discord Bot
      this.startBot()

      await this.startMessages()

      // Starts the Discord interactions
      await this.startInteractions()

      // Logging into Discord Client
      await this.loginClient()
    } catch (error) {
      logging(this.options.strings.error_starting_discord_message, error)
    }
  }

  /**
   * Deploy Discord Commands.
   *
   */
  async deployCommands() {
    try {
      // Deploy Commands
      this.deploy()
    } catch (error) {
      logging(this.options.strings.error_with_deploying_commands, error)
    }
  }

  /**
   * Wakes up Bot.
   *
   */
  startBot() {
    this.client.on('ready', () => {
      executeShellScript(
        `cd ${this.options.path} && screen -L -Logfile discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`,
      )
      this.client.user.setActivity('activity', { type: 'WATCHING' })
      logging(this.options.strings.bot_is_online_message)
    })
  }

  /**
   * Starts up messages.
   *
   */
  async startMessages() {
    this.client.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return
      const command: string = message.content.toLowerCase()

      // Command 5: Add user to server
      // mbm add [Gamertag]
      if (
        command.includes((this.options.discord_command as string) && this.options.strings.add_command) &&
        message &&
        message.member &&
        message.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + message.author.username, message.content)
        let split: string[] = message.toString().split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitAdd: string = split && split[1] ? split[1] : ''
        let splitUser: string = split && split[2] ? split[2] : ''

        if (splitCommand && splitAdd && splitUser) {
          try {
            let date: Date = new Date()

            // Backup whitelist.json file
            executeShellScript(
              `cd ${this.options.path} && git add ${
                this.options.whitelist_file
              } && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`,
            )

            // Delete old-whitelist.json file
            let files: Array<string> = await readdir(this.options.path)
            if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
              executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`)
            }

            // Make a copy of the whitelist.json file, renamed as old-whitelist.json file
            executeShellScript(
              `cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`,
            )

            let whitelistTable: any = [{}]
            let whitelistFile: string = this.options.whitelist_file
            let ignoresPlayerLimit: boolean = false
            let name: string = splitUser

            // Getting user's XUID
            const minecraft = new Minecraft()
            let xuid = await minecraft.getXuidFromGamerTag(name)

            // Read whitelist.json file
            const readFile = () => {
              fs.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(this: any, error, data) {
                if (error) {
                  throw error
                } else {
                  whitelistTable = JSON.parse(data)
                  whitelistTable.push({ ignoresPlayerLimit, name, xuid })

                  addUser(whitelistTable)
                }
              })
            }

            if (xuid !== '') {
              readFile()
            } else {
              message.channel.send(this.options.strings.xuid_not_found_message)
            }

            // Edit whitelist.json file
            const addUser = (whitelistTable: {}[]) => {
              let whitelistJSON: string = JSON.stringify(whitelistTable)
              fs.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
                if (error) {
                  throw error
                }
              })
              message.channel.send(splitUser + this.options.strings.successfully_added_user_message)
            }
          } catch (error) {
            logging(this.options.strings.error_with_adding_xuid_to_whitelist, error)
            message.channel.send(this.options.strings.error_command)
          }
        } else {
          logging(this.options.strings.error_command)
          message.channel.send(this.options.strings.error_command)
        }
      }
      // Command 6: Remove user to server
      // mbm remove [Gamertag]
      else if (
        command.includes((this.options.discord_command as string) && this.options.strings.remove_command) &&
        message &&
        message.member &&
        message.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + message.author.username, message.content)
        let split: string[] = message.toString().split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitRemove: string = split && split[1] ? split[1] : ''
        let splitUser: string = split && split[2] ? split[2] : ''

        if (splitCommand && splitRemove && splitUser) {
          try {
            let date: Date = new Date()

            // Backup whitelist.json file
            executeShellScript(
              `cd ${this.options.path} && git add ${
                this.options.whitelist_file
              } && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`,
            )

            // Delete old-whitelist.json file
            let files: Array<string> = await readdir(this.options.path)
            if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
              executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`)
            }

            // Make a copy of the whitelist.json file, renamed as old-whitelist.json file
            executeShellScript(
              `cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`,
            )

            let whitelistFile: string = this.options.whitelist_file
            let userNames: string[] = []

            // Read whitelist.json file
            fs.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(this: any, error, data) {
              if (error) {
                logging(this.options.strings.error_with_reading_file, error)
              } else {
                let whitelistData = JSON.parse(data)

                whitelistData.forEach(function (whitelistData: { name: string }) {
                  userNames.push(whitelistData.name)
                })

                removeUser(whitelistData)
              }
            })

            // Edit whitelist.json file
            const removeUser = (whitelistData: any[]) => {
              if (!userNames.includes(splitUser)) {
                message.channel.send(this.options.strings.user_not_found_message)
              } else {
                let updatedData: string[] = whitelistData.filter(
                  (whitelistData: { name: string }) => whitelistData.name !== splitUser,
                )
                let whitelistJSON: string = JSON.stringify(updatedData)

                fs.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
                  if (error) {
                    message.channel.send(this.options.strings.error_command)
                    throw error
                  }
                })
                message.channel.send(splitUser + this.options.strings.successfully_removed_user_message)
              }
            }
          } catch (error) {
            logging(this.options.strings.error_with_removing_xuid_from_whitelist, error)
            message.channel.send(this.options.strings.error_command)
          }
        } else {
          logging(this.options.strings.error_command)
          message.channel.send(this.options.strings.error_command)
        }
      }
    })
  }

  /**
   * Starts up interactions.
   *
   */
  async startInteractions() {
    this.client.on('interactionCreate', async (interaction: any) => {
      if (!interaction.isCommand()) return

      const { commandName } = interaction

      // Command 1: Start Server Command
      // /start
      if (
        commandName === this.options.strings.start_command &&
        interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + interaction.user.username, commandName)
        try {
          executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -s`)
          interaction.reply(this.options.strings.successful_command_message)
        } catch (error) {
          logging(this.options.strings.error_with_start_command, error)
          interaction.reply(this.options.strings.error_command)
        }
        // Command 2: Stop Server Command
        // /stop
      } else if (
        commandName === this.options.strings.stop_command &&
        interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + interaction.user.username, commandName)
        try {
          executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -st`)
          interaction.reply(this.options.strings.successful_command_message)
        } catch (error) {
          logging(this.options.strings.error_with_stop_command, error)
          interaction.reply(this.options.strings.error_command)
        }
      }
      // Command 3: Restart Server Command
      // /restart
      else if (
        commandName === this.options.strings.restart_command &&
        interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + interaction.user.username, commandName)
        try {
          executeShellScript(`cd ${this.options.path} && ${this.options.discord_command} -r`)
          interaction.reply(this.options.strings.successful_command_message)
        } catch (error) {
          logging(this.options.strings.error_with_restart_command, error)
          interaction.reply(this.options.strings.error_command)
        }
      }
      // Command 4: Help Command - List available Discord commands
      // /help
      else if (
        commandName === this.options.strings.help_command &&
        interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + interaction.user.username, commandName)
        try {
          interaction.reply(
            '**Available Commands:** \n' +
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
              ' [Gamertag]',
          )
        } catch (error) {
          logging(this.options.strings.error_with_help_command, error)
          interaction.reply(this.options.strings.error_command)
        }
        // Send invalid permissions message to channel
      } else {
        interaction.reply(this.options.strings.invalid_permission_command)
      }
    })
  }

  /**
   * Logging into Discord Client.
   *
   */
  async loginClient() {
    this.client.login(this.options.discord_token)
  }

  /**
   * Deploy Commands.
   *
   */
  async deploy() {
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
    ].map((command) => command.toJSON())

    const rest = new REST({ version: '9' }).setToken(this.options.discord_token as string)

    ;(async () => {
      try {
        await rest.put(
          Routes.applicationGuildCommands(this.options.client_id as string, this.options.discord_id as string),
          {
            body: commands,
          },
        )

        logging(this.options.strings.successfully_deployed_commands)
      } catch (error) {
        logging(this.options.strings.error_with_deploying_commands, error)
      }
    })()
  }
}

export default Discord
