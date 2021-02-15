import chokidar from 'chokidar'
import Discord from 'discord.js'
import { promises as fs } from 'fs'
import os from 'os'
import shell from 'shelljs'
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
  start_server_message: string | undefined
  stop_server_message: string | undefined
  start_compressing_files_message: string | undefined
  end_compressed_files_message: string | undefined
  sending_discord_message: string | undefined
  error_discord_message: string | undefined
  gamertag_join_server_message: string | undefined
  gamertag_left_server_message: string | undefined
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
        world_path: process.env.WORLD_PATH || os.homedir() + '/MinecraftServer/worlds',
        backup_path: process.env.BACKUP_PATH || os.homedir() + '/Backups/',
        log_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/minecraft-server.log',
        discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
        strings: {
          pre_backup_message:
            process.env.options_pre_backup_message ||
            'We are shutting down the server temporarily. We are making a backup.',
          post_backup_message:
            process.env.options_post_backup_message || 'We are done with the backup. The server is back on.',
          error_backup_message:
            process.env.options_error_backup_message || 'Something went wrong while building out the backup.',
          start_server_message: process.env.options_start_server_message || 'Starting up the server.',
          stop_server_message: process.env.options_stop_server_message || 'Stopping the server.',
          start_compressing_files_message:
            process.env.options_start_compressing_files_message || 'Starting to compress files.',
          end_compressed_files_message: process.env.options_end_compressed_files_message || 'Files are now compressed.',
          sending_discord_message: process.env.options_sending_discord_message || 'Sending this message to Discord.',
          error_discord_message:
            process.env.options_error_discord_message || 'Something went wrong when sending the Discord message.',
          gamertag_join_server_message:
            process.env.options_gamertag_join_server_message || 'joined the Minecraft server.',
          gamertag_left_server_message:
            process.env.options_gamertag_left_server_message || 'left the Minecraft server.',
        },
      }
    }
  }

  /**
   * Start the execution.
   */
  async restartServer() {
    try {
      // Send message to Discord that a backup has begun
      await this.sendMessageToDiscord(this.options.strings.pre_backup_message)

      // Stops Minecraft server
      await this.stopServer()

      // Starts Minecraft server
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
    // Backups
    await this.backupServer()
    logging(this.options.strings.start_server_message)
    this.executeShellScript(
      `cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `,
    )
    this.sendMessageToDiscord(this.options.strings.start_server_message)
  }

  async backupServer() {
    let date = new Date()
    shell.exec(`cd ${this.options.world_path}`)
    shell.exec(`git add .`)
    if (shell.exec(`git commit -m "Automatic Backup: ${date.toISOString()}"`).code !== 0) {
      shell.echo('Error: Git commit failed')
      shell.exit(1)
    }
    shell.exec(`git push`)
  }

  /**
   * It uses Shelljs to kill all the screens.
   */
  async stopServer() {
    logging(this.options.strings.stop_server_message)
    this.executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`)
    this.sendMessageToDiscord(this.options.strings.stop_server_message)
  }

  executeShellScript(string: string): string {
    logging(`Executing this shell command: ${string}`)
    let results = ''

    if (process.env.ENVIRONMENT !== 'DEVELOPMENT') {
      results = shell.exec(string, { silent: true })
    }
    logging('Execution output', results)

    return results
  }
  /**
   * Sends a message to Discord
   * @param string
   * @url https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
   */
  async sendMessageToDiscord(string: string) {
    logging(this.options.strings.sending_discord_message, string)
    try {
      const webhook: WebhookInterface = new Discord.WebhookClient(this.options.discord_id, this.options.discord_token)
      await webhook.send(`[${os.hostname()}] ${string}`)
    } catch (err) {
      logging(this.options.strings.error_discord_message, err)
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
            this.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_left_server_message)
          } else if (element.includes(this.logs_strings.player_connected)) {
            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected)
            this.sendMessageToDiscord(gamerTag + ' ' + this.options.strings.gamertag_join_server_message)
          }
        }

        fileNumber = newFile.split(/\n/).length
      }
    })
  }

  getGamerTagFromLog(logString: string, logIndentifier: string) {
    return logString
      .split(logIndentifier)[1]
      .split(',')[0]
      .split(' ')[1]
  }
}
export default Minecraft
