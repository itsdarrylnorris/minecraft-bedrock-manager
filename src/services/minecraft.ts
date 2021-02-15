import chokidar from 'chokidar'
import Discord from 'discord.js'
import { promises as fs } from 'fs'
import os from 'os'
import shell from 'shelljs'
import zipper from 'zip-local'
import { logging } from '../utils'
require('dotenv').config()

/**
 * Interface of Minecraft.
 */
interface MinecraftOptionsInterface {
  // Webhook string
  discord: MinecraftDiscordInterface | undefined

  // Path of the location where all the files lives
  path: string | undefined

  // Any options to ensure we can support google drive backups. // @TODO: We need to change the any and past an interface here. Depending on what we need to for Google Drive.
  google_drive: any | undefined

  // Strings of whatever we are going to be posting at
  strings: MinecraftStringsInterface

  // If set, we want to move the file into this location.
  backup_path: string | undefined
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
 * Handling the strings as configuration so we can easily change them if needed.
 */
interface MinecraftStringsInterface {
  pre_backup_message: string | undefined
  post_backup_message: string | undefined
  error_backup_message: string | undefined
}

/**
 * Minecraft.
 *
 */
class Minecraft {
  // Options config
  private options: MinecraftOptionsInterface | any

  private logs_strings: any = {
    player_disconnected: '[INFO] Player disconnected:',
    player_connected: '[INFO] Player connected:',
  }

  private minecraft_screen_name: string = 'Minecraft'

  /**
   * Constructor
   * @param options
   */

  constructor(options: MinecraftOptionsInterface | any) {
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.OPTIONS_PATH || os.homedir() + '/MinecraftServer/',
        backup_path: process.env.BACKUP_PATH || os.homedir() + '/Backups/',
        log_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/minecraft-server.log',
        discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
        strings: {
          pre_backup_message:
            process.env.options_pre_backup_message ||
            'We are shutting down the server temporary, we are making a backup.',
          post_backup_message:
            process.env.options_post_backup_message || 'We are done with the backup, the server is back on.',
          error_backup_message:
            process.env.options_error_backup_message || 'Something went wrong while building out the backup',
        },
      }
    }
  }

  /**
   * Start the execution.
   */
  async restartServer() {
    try {
      // Send message to Discord that we are starting
      await this.sendMessageToDiscord(this.options.strings.pre_backup_message) // Stopping server

      // Stops Minecraft server
      await this.stopServer()

      await this.startServer()
    } catch (e) {
      logging(e)
      this.sendMessageToDiscord(this.options.strings.post_backup_message)
    }
    return
  }

  /**
   * Starts the server using screen command.
   *
   * This might be a bit tricky because of screen; however we can try this: https://stackoverflow.com/questions/24706815/how-do-i-pass-a-command-to-a-screen-session
   */
  async startServer() {
    logging('Starting up the server')
    this.executeShellScript(
      `cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `,
    )
    this.sendMessageToDiscord(`Starting up server`)
  }

  /**
   * It uses Shelljs to kill all the screens.
   */
  async stopServer() {
    logging('Stopping server')
    this.executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`)
    this.sendMessageToDiscord(`Stopping the server`)
  }

  executeShellScript(string: string): string {
    logging(`Executing this shell command: ${string}`)
    let results = ''

    if (process.env.ENVIRONMENT !== 'DEVELOPMENT') {
      results = shell.exec(string, { silent: true }).stdout
    }
    logging('Execution output', results)

    return results
  }

  /**
   * Compress the file from this.options.path
   */
  async compressFile() {
    logging('Compressing file')
    let date = new Date()

    try {
      shell.cd(this.options.backup_path)
      await zipper.sync.zip(this.options.path).compress().save(`${date.toISOString()}-minecraft.zip`)
    } catch (err) {
      logging('Error', err)
    }

    logging('Done Compressing file. Deleted MinecraftServer Folder')
    return
  }

  /**
   * Sends a message to Discord
   * @param string
   * @url https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
   */
  async sendMessageToDiscord(string: string) {
    logging('Sending this message to discord', string)
    try {
      const webhook: WebhookInterface = new Discord.WebhookClient(this.options.discord_id, this.options.discord_token)
      await webhook.send(`[${os.hostname()}] ${string}`)
    } catch (err) {
      logging('Something went wrong posting the discord message', err)
    }
    return
  }

  async logs() {
    logging('Watching for changes')

    let file = await fs.readFile(this.options.log_file, 'utf8')
    let fileNumber = file.split(/\n/).length

    chokidar.watch(this.options.log_file).on('all', async (evt, path) => {
      console.log(evt, path)
      if (evt === 'change') {
        let newFile = await fs.readFile(path, 'utf8')
        let newFileNumber = newFile.split(/\n/).length
        if (fileNumber < newFileNumber) {
          const element = newFile.split(/\n/)[newFileNumber - 2]

          if (element.includes(this.logs_strings.player_disconnected)) {
            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_disconnected)
            this.sendMessageToDiscord(`${gamerTag} left the Minecraft server.`)
          } else if (element.includes(this.logs_strings.player_connected)) {
            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected)
            this.sendMessageToDiscord(`${gamerTag} joined the Minecraft server.`)
          }
        }

        fileNumber = newFile.split(/\n/).length
      }
    })
  }

  getGamerTagFromLog(logString: string, logIndentifier: string) {
    return logString.split(logIndentifier)[1].split(',')[0].split(' ')[1]
  }
}
export default Minecraft
