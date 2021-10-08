import fs, { PathLike } from 'fs'
import { readdir } from 'fs/promises'
import os from 'os'
import { executeShellScript, logging } from '../../utils'
const { Client, Collection, Intents, WebhookClient, WebhookInterface, Message } = require('discord.js')
require('dotenv').config()

// const discord_token = process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : ''

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
  discord_id: string | undefined

  // Discord Token
  discord_token: string | undefined

  // Strings that are used to post
  strings: DiscordStringsInterface
}

// /**
//  * Interface of Discord, it contains any information related to discord.
//  */
// interface MinecraftDiscordInterface {
//   webhook: string | undefined
//   discord_info: WebhookInterface
// }

// interface WebhookInterface {
//   send: any
//   id: string
//   token: string
// }

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
  help_command_message: string
  command_entered_message: string
  successfully_added_user_message: string
  successfully_removed_user_message: string
  user_not_found_message: string
  xuid_not_found_message: string
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
  add_command_description: string
  remove_command_description: string
}

/**
 * Discord.
 *
 */
class Discord {
  // Options configuration
  options: DiscordOptionsInterface

  private client: typeof Client

  private discord_screen_name: string = 'Discord'

  /**
   * Constructor
   * @param options
   */
  constructor(options?: DiscordOptionsInterface) {
    // Create a new client instance
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
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
          help_command_message:
            process.env.options_help_command_message ||
            'Available Commands: /start server, /stop server, /restart server, /help, /add [Gamertag], /remove [Gamertag]',
          command_entered_message: process.env.options_command_entered_message || 'Command entered by: ',
          successfully_added_user_message:
            process.env.options_successfully_added_user_message ||
            ' has been added to the server. Restart the server to complete the adding process.',
          successfully_removed_user_message:
            process.env.options_successfully_removed_user_message ||
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
      const webhook: typeof WebhookInterface = new WebhookClient(this.options.discord_id, this.options.discord_token)
      await webhook.send(`[${os.hostname()}] ${string}`)
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
      console.log('pass')
      // Starts the Discord interactions
      await this.startInteractions()

      // Logging into Discord Client
      await this.loginClient()
    } catch (error) {
      logging(this.options.strings.error_starting_discord_message, error)
    }
  }

  /**
   * Wakes up Bot.
   *
   */
  startBot() {
    this.client.once('ready', () => {
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
    this.client.on('messageCreate', async (message: typeof Message) => {
      console.log(message)
      if (message.author.bot) return
      const command: string = message.content.toLowerCase()
      console.log(command)
      // Command 5: Add user to server
      // /add [Gamertag]
      if (
        command.includes((this.options.discord_command as string) && this.options.strings.add_command) &&
        message.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + message.author.username, message.content)
        let split: string[] = message.toString().split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitAdd: string = split && split[1] ? split[1] : ''
        let splitUser: string = split && split[2] ? split[2] : ''

        console.log(split, splitCommand, splitAdd, splitUser)

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

            // const minecraft = new Minecraft()
            // let xuid = await minecraft.getXuidFromGamerTag(name)
            let xuid = '2535420684212926'

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
            logging('Could not add xuid to whitelist', error)
            message.channel.send(this.options.strings.error_command)
          }
        } else {
          logging(this.options.strings.error_command)
          message.channel.send(this.options.strings.error_command)
        }
      }
      // Command 6: Remove user to server
      // /remove [Gamertag]
      else if (
        command.includes((this.options.discord_command as string) && this.options.strings.remove_command) &&
        message.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      ) {
        logging(this.options.strings.command_entered_message + message.author.username, message.content)
        let split: string[] = message.oString().split(' ')
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
            logging('Could not remove xuid from whitelist', error)
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
          logging('Could not execute start command', error)
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
          logging('Could not execute help command', error)
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
          logging('Could not execute help command', error)
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
          interaction.reply(this.options.strings.help_command_message)
        } catch (error) {
          logging('Could not execute help command', error)
          interaction.reply(this.options.strings.error_command)
        }
      }

      // // Command 5: Add user to server
      // // /add [Gamertag]
      // else if (
      //   commandName === this.options.strings.add_command &&
      //   interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      // ) {
      //   logging(this.options.strings.command_entered_message + interaction.user.username, interaction.commandName)
      //   let split: string[] = interaction.toString().split(' ')
      //   let splitCommand: string = split && split[0] ? split[0] : ''
      //   let splitAdd: string = split && split[1] ? split[1] : ''
      //   let splitUser: string = split && split[2] ? split[2] : ''

      //   console.log(split, splitCommand, splitAdd, splitUser)

      //   if (splitCommand && splitAdd && splitUser) {
      //     try {
      //       let date: Date = new Date()

      //       // Backup whitelist.json file
      //       executeShellScript(
      //         `cd ${this.options.path} && git add ${
      //           this.options.whitelist_file
      //         } && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`,
      //       )

      //       // Delete old-whitelist.json file
      //       let files: Array<string> = await readdir(this.options.path)
      //       if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
      //         executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`)
      //       }

      //       // Make a copy of the whitelist.json file, renamed as old-whitelist.json file
      //       executeShellScript(
      //         `cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`,
      //       )

      //       let whitelistTable: any = [{}]
      //       let whitelistFile: string = this.options.whitelist_file
      //       let ignoresPlayerLimit: boolean = false
      //       let name: string = splitUser

      //       // const minecraft = new Minecraft()
      //       // let xuid = await minecraft.getXuidFromGamerTag(name)
      //       let xuid = '2535420684212926'

      //       // Read whitelist.json file
      //       const readFile = () => {
      //         fs.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(this: any, error, data) {
      //           if (error) {
      //             throw error
      //           } else {
      //             whitelistTable = JSON.parse(data)
      //             whitelistTable.push({ ignoresPlayerLimit, name, xuid })

      //             addUser(whitelistTable)
      //           }
      //         })
      //       }

      //       if (xuid !== '') {
      //         readFile()
      //       } else {
      //         interaction.reply(this.options.strings.xuid_not_found_message)
      //       }

      //       // Edit whitelist.json file
      //       const addUser = (whitelistTable: {}[]) => {
      //         let whitelistJSON: string = JSON.stringify(whitelistTable)
      //         fs.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
      //           if (error) {
      //             throw error
      //           }
      //         })
      //         interaction.reply(splitUser + this.options.strings.successfully_added_user_message)
      //       }
      //     } catch (error) {
      //       logging('Could not add xuid to whitelist', error)
      //       interaction.reply(this.options.strings.error_command)
      //     }
      //   } else {
      //     logging(this.options.strings.error_command)
      //     interaction.reply(this.options.strings.error_command)
      //   }
      // }
      // // Command 6: Remove user to server
      // // /remove [Gamertag]
      // else if (
      //   commandName === this.options.strings.help_command &&
      //   interaction.member.roles.cache.some((role: any) => role.name === this.options.discord_role)
      // ) {
      //   logging(this.options.strings.command_entered_message + interaction.user.username, commandName)
      //   let split: string[] = interaction.toString().split(' ')
      //   let splitCommand: string = split && split[0] ? split[0] : ''
      //   let splitRemove: string = split && split[1] ? split[1] : ''
      //   let splitUser: string = split && split[2] ? split[2] : ''

      //   if (splitCommand && splitRemove && splitUser) {
      //     try {
      //       let date: Date = new Date()

      //       // Backup whitelist.json file
      //       executeShellScript(
      //         `cd ${this.options.path} && git add ${
      //           this.options.whitelist_file
      //         } && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`,
      //       )

      //       // Delete old-whitelist.json file
      //       let files: Array<string> = await readdir(this.options.path)
      //       if (files.filter((item) => item.includes(this.options.old_whitelist_file))) {
      //         executeShellScript(`cd ${this.options.path} && ` + `rm ${this.options.old_whitelist_file}`)
      //       }

      //       // Make a copy of the whitelist.json file, renamed as old-whitelist.json file
      //       executeShellScript(
      //         `cd ${this.options.path} && ` + `cp ${this.options.whitelist_file} ${this.options.old_whitelist_file}`,
      //       )

      //       let whitelistFile: string = this.options.whitelist_file
      //       let userNames: string[] = []

      //       // Read whitelist.json file
      //       fs.readFile(this.options.whitelist_file, 'utf8', function readFileCallback(this: any, error, data) {
      //         if (error) {
      //           logging(this.options.strings.error_with_reading_file, error)
      //         } else {
      //           let whitelistData = JSON.parse(data)

      //           whitelistData.forEach(function (whitelistData: { name: string }) {
      //             userNames.push(whitelistData.name)
      //           })

      //           removeUser(whitelistData)
      //         }
      //       })

      //       // Edit whitelist.json file
      //       const removeUser = (whitelistData: any[]) => {
      //         if (!userNames.includes(splitUser)) {
      //           interaction.channel.send(this.options.strings.user_not_found_message)
      //         } else {
      //           let updatedData: string[] = whitelistData.filter(
      //             (whitelistData: { name: string }) => whitelistData.name !== splitUser,
      //           )
      //           let whitelistJSON: string = JSON.stringify(updatedData)

      //           fs.writeFile(whitelistFile, whitelistJSON, 'utf8', (error) => {
      //             if (error) {
      //               interaction.reply(this.options.strings.error_command)
      //               throw error
      //             }
      //           })
      //           interaction.reply(splitUser + this.options.strings.successfully_removed_user_message)
      //         }
      //       }
      //     } catch (error) {
      //       logging('Could not remove xuid from whitelist', error)
      //       interaction.reply(this.options.strings.error_command)
      //     }
      //   } else {
      //     logging(this.options.strings.error_command)
      //     interaction.reply(this.options.strings.error_command)
      //   }
      // }
      // Send message back to channel with an error
      else {
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
}

export default Discord