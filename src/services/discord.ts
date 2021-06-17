import { Client, Collection, Message, WebhookClient } from 'discord.js'
import os from 'os'
import { executeShellScript, logging } from '../utils'
require('dotenv').config()

/**
 * Interface of Discord.
 */
interface DiscordOptionsInterface {
  message: Message
  // Webhook string
  discord: MinecraftDiscordInterface | undefined
  sending_discord_message: string | undefined
  error_discord_message: string | undefined
}

/**
 * Interface of Discord, it contains any information related to discord.
 */
interface MinecraftDiscordInterface {
  webhook: string | undefined
  discord_info: WebhookInterface
}

interface WebhookInterface {
  send: any
  id: string
  token: string
}

/**
 * Discord
 */
class Discord {
  // Options config
  private options: DiscordOptionsInterface | any

  private client: Client

  private discord_screen_name: string = 'Discord'

  /**
   * Constructor
   * @param options
   */
  constructor(options: DiscordOptionsInterface | any) {
    const client = new Client()
    client.commands = new Collection()
    this.client = client
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.OPTIONS_PATH || os.homedir() + '/MinecraftServer/',
        discord_client:
          process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
        discord_role: process && process.env && process.env.DISCORD_ROLE ? process.env.DISCORD_ROLE.toString() : '',
        discord_command:
          process && process.env && process.env.DISCORD_COMMAND ? process.env.DISCORD_COMMAND.toString() : '',
        discord_message_prefix:
          process && process.env && process.env.DISCORD_PREFIX ? process.env.DISCORD_PREFIX.toString() : '',
        discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
        sending_discord_message: process.env.options_sending_discord_message || 'Sending this message to Discord.',
        error_discord_message:
          process.env.options_error_discord_message || 'Something went wrong when sending the Discord message.',
        strings: {
          start_command: 'start server',
          stop_command: 'stop server',
          restart_command: 'restart server',
          help_command: 'help',
          add_command: 'add',
          remove_command: 'remove',
        },
      }
    }
  }

  /**
   * Sends a message to Discord.
   *
   * @param string String message for Discord.
   */
  async sendMessageToDiscord(string: string): Promise<void> {
    logging(this.options.strings.sending_discord_message, string)
    try {
      const webhook: WebhookInterface = new WebhookClient(this.options.discord_id, this.options.discord_token)
      await webhook.send(`[${os.hostname()}] ${string}`)
    } catch (err) {
      logging(this.options.strings.error_discord_message, err)
    }
  }

  /**
   * Start Discord
   */
  async startDiscord() {
    try {
      // Wakes up Discord Bot
      this.startBot()

      // Starts the Discord commands
      await this.startCommands()

      // Logging into Discord Client
      await this.loginClient()
    } catch (e) {
      logging('Error Start Discord', e)
    }
  }

  /**
   * Wakes up Bot
   */
  startBot() {
    this.client.once('ready', () => {
      executeShellScript(
        `cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.discord_screen_name}`,
      )
      logging('Bot is online.')
    })
  }

  /**
   * Starts the Discord commands
   */
  async startCommands() {
    this.client.on('message', (message: Message) => {
      if (!message.content.startsWith(this.options.discord_message_prefix) || message.author.bot) return

      const args: any = message.content.slice(this.options.discord_message_prefix.length)
      const command: string = args.toLowerCase()
      let author: string = message.author.username
      let splitDiscordRole: string = this.options.discord_role.split(',')

      // Command 1: Start Server Command
      // /mm start server
      if (
        command === `${this.options.discord_command} ${this.options.strings.start_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        try {
          logging('Command entered by: ' + author, command)
          executeShellScript(`cd ${this.options.path} && mm -s`)
          message.channel.send('Sent command successfully.')
        } catch (error) {
          logging(error)
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Command 2: Stop Server Command
      // /mm stop server
      else if (
        command === `${this.options.discord_command} ${this.options.strings.stop_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        logging('Command entered by: ' + author, command)
        executeShellScript(`cd ${this.options.path} && mm -st`)
        try {
          message.channel.send('Sent command successfully.')
        } catch (error) {
          logging(error)
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Command 3: Restart Server Command
      // /mm restart server
      else if (
        command === `${this.options.discord_command} ${this.options.strings.restart_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        logging('Command entered by: ' + author, command)
        executeShellScript(`cd ${this.options.path} && mm -r`)
        try {
          message.channel.send('Sent command successfully.')
        } catch (error) {
          logging(error)
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Command 4: Help Command - List available Discord commands
      // /mm help
      else if (
        command === `${this.options.discord_command} ${this.options.strings.help_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        try {
          message.channel.send(
            'Available Commands: /mm start server, /mm stop server, /mm restart server, /mm help, /mm add [Gamertag], /mm remove [Gamertag]',
          )
        } catch (error) {
          logging(error)
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Command 5: Add user to server
      // /mm add [Gamertag]
      else if (
        command === `${this.options.discord_command} ${this.options.strings.add_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        logging(command)
        let newMessage: string = message.toString().replace('/', '')
        let split: string[] = newMessage.split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitValue: string = split && split[1] ? split[1] : ''

        if (splitCommand && splitValue) {
          logging('Command entered by: ' + author, { splitCommand, splitValue })
          message.channel.send('Sent command successfully.')
        } else if (splitCommand && !splitValue) {
          logging('Command entered by: ' + author, { splitCommand })
          message.channel.send('Sent command successfully.')
        } else {
          logging(author + 'There was an error when trying to execute that command!')
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Command 6: Remove user to server
      // /mm remove [Gamertag]
      else if (
        command === `${this.options.discord_command} ${this.options.strings.remove_command}` &&
        message.member!.roles.cache.some((r: { name: string }) => splitDiscordRole.includes(r.name))
      ) {
        logging(command)
        let newMessage: string = message.toString().replace('/', '')
        let split: string[] = newMessage.split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitValue: string = split && split[1] ? split[1] : ''

        if (splitCommand && splitValue) {
          logging('Command entered by: ' + author, { splitCommand, splitValue })
          message.channel.send('Sent command successfully.')
        } else if (splitCommand && !splitValue) {
          logging('Command entered by: r' + author, { splitCommand })
          message.channel.send('Sent command successfully.')
        } else {
          logging(author + 'There was an error when trying to execute that command!')
          message.channel.send('There was an error when trying to execute that command!')
        }
      }
      // Send message back to channel with an error
      else {
        message.reply('You are not allowed to use this command.')
      }
    })
  }

  /**
   * Logging into Discord Client
   */
  async loginClient() {
    this.client.login(this.options.discord_client)
  }
}
export default Discord
