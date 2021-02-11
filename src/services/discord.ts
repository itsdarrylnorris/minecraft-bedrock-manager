import { Client, Collection, Message } from 'discord.js'
require('dotenv').config()

const client = new Client()
client.commands = new Collection()

/**
 * Interface of Discord.
 */
interface DiscordOptionsInterface {
  message: Message
}

/**
 * Discord
 *
 */
class Discord {
  // Options config
  private options: DiscordOptionsInterface | any

  /**
   * Constructor
   * @param options
   */
  constructor(options: DiscordOptionsInterface | any) {
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        discordClient:
          process && process.env && process.env.DISCORD_CLIENT ? process.env.DISCORD_CLIENT.toString() : '',
        prefix: '/',
      }
    }
  }

  /**
   * Start Discord
   */
  async startDiscord() {
    try {
      // Wakes up Bot
      await this.startBot()

      // Starts the Commands
      await this.startCommands()

      // Logging into Discord Client
      await this.loginClient()
    } catch (e) {
      this.logging(e)
    }
  }

  /**
   * Wakes up Bot
   */
  async startBot() {
    client.once('ready', () => {
      this.logging('Bot is online')
    })
  }

  /**
   * Starts the Commands
   */
  async startCommands() {
    client.on('message', (message: Message) => {
      if (!message.content.startsWith(this.options.prefix) || message.author.bot) return
      const args: any = message.content.slice(this.options.prefix.length).split(/ +/)
      const command: string = args.shift()!.toLowerCase()
      let author: string = message.author.username

      // Adjust the command and role based on server
      if (command === 'mm' && message.member!.roles.cache.some((r: { name: string }) => r.name === 'Devs')) {
        let newMessage: string = message.toString().replace('/', '')
        let split: string[] = newMessage.split(' ')
        let splitCommand: string = split && split[0] ? split[0] : ''
        let splitValue: string = split && split[1] ? split[1] : ''

        if (splitCommand && splitValue) {
          this.logging('Command entered by:' + author, { splitCommand, splitValue })
          message.channel.send('Sent command successfully.')
        } else if (splitCommand && !splitValue) {
          this.logging('Command entered by:' + author, { splitCommand })
          message.channel.send('Sent command successfully.')
        } else {
          this.logging(author + 'There was an error when trying to execute that command!')
          message.channel.send('There was an error when trying to execute that command!')
        }
      } else {
        message.reply('You are not allowed to use this command.')
      }
    })
  }

  /**
   * Logging into Discord Client
   */
  async loginClient() {
    client.login(this.options.discordClient)
  }

  /**
   * Logging wrapper around console.log with timestamps.
   *
   */
  logging = (message: string, payload: any = null) => {
    let date = new Date()

    console.log(`[${date.toISOString()}] ${message}`)

    if (payload) {
      if (typeof payload === 'string' || payload instanceof String) {
        console.log(`[${date.toISOString()}] ${payload}`)
      } else {
        console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`)
      }
    }
  }
}
export default Discord
