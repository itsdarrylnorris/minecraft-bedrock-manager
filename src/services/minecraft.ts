import cheerio from 'cheerio'
import chokidar from 'chokidar'
import Discord from 'discord.js'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import os from 'os'
import { executeShellScript, logging } from '../utils'
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

  // Path of all downloads
  download_path: string | undefined
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
  max_number_files_in_downloads_folder: number
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
  version_download: string | undefined
  download_button: string | undefined
  not_up_to_date_server_message: string | undefined
  updated_server_message: string | undefined
  error_downloading_version: string | undefined
  deleted_oldest_version_success: string | undefined
  error_deleting_oldest_version: string | undefined
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
        download_path: process.env.DOWNLOAD_PATH || os.homedir() + '/Downloads3/', // @TODO: change
        log_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/minecraft-server.log',
        discord_id: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discord_token: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
        numbers: {
          max_number_files_in_downloads_folder: process.env.options_max_number_files_in_downloads_folder || 3,
        },
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
          version_download:
            process.env.options_versions_downloads || 'https://www.minecraft.net/en-us/download/server/bedrock/',
          download_button: process.env.options_download_button || '[data-platform="serverBedrockLinux"]',
          not_up_to_date_server_message:
            process.env.options_not_up_to_date_server_message ||
            `Server is not up to date. Updating server to latest version: `,
          updated_server_message: process.env.options_updated_server_message || `Server is up to date.`,
          error_downloading_version:
            process.env.options_error_downloading_version || `An error occurred while downloading latest file.`,
          deleted_oldest_version_success:
            process.env.options_deleted_oldest_version_success || `Oldest file has been deleted: `,
          error_deleting_oldest_version:
            process.env.options_error_deleting_oldest_version || `An error occurred while deleting the oldest file.`,
        },
      }
    }
  }

  /**
   * Start the execution.
   */
  async restartServer() {
    try {
      // Sends message to Discord that a backup has begun
      await this.sendMessageToDiscord(this.options.strings.pre_backup_message)

      // Stops Minecraft server
      await this.stopServer()

      // Starts Minecraft server
      await this.startServer()

      // Sends message to Discord that backup is complete
      this.sendMessageToDiscord(this.options.strings.post_backup_message)
    } catch (e) {
      logging(e)
    }
    return
  }

  /**
   * Starts the server using screen command.
   */
  async startServer() {
    // Sends message to Discord that server is stopping
    logging(this.options.strings.stop_server_message)

    // Backups Server
    await this.backupServer()

    // Checks for latest version
    let versionLink: string | undefined = await this.checkForLatestVersion()

    // Gets last item in Download Folder
    await this.getLastItemInDownload(versionLink)

    // Deletes oldest file if Download folder exceeds preferred capacity
    await this.deleteOldestFile()

    executeShellScript(
      `cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `,
    )

    // Sends message to Discord that server is starting up
    this.sendMessageToDiscord(this.options.strings.start_server_message)
  }

  // Commits backup to Git Repository
  async backupServer() {
    let date: Date = new Date()
    let script: string = `cd ${
      this.options.path
    } && git add . && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`
    executeShellScript(script)
  }

  // Checks for latest version
  async checkForLatestVersion() {
    try {
      let downloadURL: string = this.options.strings.version_download
      const response = await fetch(downloadURL)
      const html: any = await response.text()
      const $: cheerio.Root = cheerio.load(html)
      const button: cheerio.Cheerio = $(this.options.strings.download_button)
      const buttonData: cheerio.Element = button[0]
      Object.values(buttonData)
      const versionLink: string | undefined = Object.values(buttonData)[3].href
      return versionLink
    } catch (err) {
      console.log(err)
    }
  }

  // Gets last item in Download Folder
  async getLastItemInDownload(versionLink: string | undefined) {
    try {
      const latestVersionZip: string | undefined =
        versionLink && versionLink.split('/')[versionLink.split('/').length - 1]
      let files: Array<string> = await fs.readdir(this.options.download_path)
      let lastFile: string = files[files.length - 1]
      if (lastFile !== latestVersionZip) {
        this.updateServer(versionLink)
      } else {
        logging(this.options.strings.updated_server_message)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Updates server
  async updateServer(versionLink: string | undefined) {
    try {
      const latestVersionZip: string | undefined =
        versionLink && versionLink.split('/')[versionLink.split('/').length - 1]
      logging(this.options.strings.not_up_to_date_server_message + latestVersionZip)
      executeShellScript(
        `cd ${this.options.download_path} && wget ${versionLink} && cd ${this.options.path} && unzip -o "${this.options.download_path}${latestVersionZip}" -x "*server.properties*" "*permissions.json*" "*whitelist.json*" "*valid_known_packs.json*"`,
      )
    } catch (err) {
      logging(this.options.strings.error_downloading_version)
      console.log(err)
    }
  }

  // Deletes oldest file if Download folder exceeds preferred capacity
  async deleteOldestFile() {
    try {
      let files: Array<string> = await fs.readdir(this.options.download_path)
      const count: number = files.filter(item => item.includes('zip')).length
      if (count > this.options.numbers.max_number_files_in_downloads_folder) {
        let oldFile: string = files[1]
        executeShellScript(`cd ${this.options.download_path} && rm ${oldFile}`)
        logging(this.options.strings.deleted_oldest_version_success + oldFile)
      }
    } catch (err) {
      logging(this.options.strings.error_deleting_oldest_version)
      console.log(err)
    }
  }

  /**
   * Stops the server
   */
  async stopServer() {
    logging(this.options.strings.stop_server_message)
    executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`)
    this.sendMessageToDiscord(this.options.strings.stop_server_message)
  }

  /**
   * Sends a message to Discord
   * @param string
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
