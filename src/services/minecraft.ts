import cheerio from 'cheerio'
import chokidar from 'chokidar'
import { promises as fs } from 'fs'
import os from 'os'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { executeShellScript, logging } from '../utils'
import Discord from './discord'
require('dotenv').config()

/**
 * Minecraft Interface.
 */
interface MinecraftOptionsInterface {
  // Path location of all files
  path: string | undefined

  // If set, moves files into a backup location
  backup_path: string | undefined

  // Path location of all downloads
  download_path: string | undefined

  // Minecraft log file
  log_file: string | undefined

  // Strings that are used to post
  strings: MinecraftStringsInterface

  // Numbers
  numbers: MinecraftNumbersInterface
}

/**
 * Editable configuration for strings.
 */
interface MinecraftStringsInterface {
  pre_backup_message: string | undefined
  post_backup_message: string | undefined
  error_backup_message: string | undefined
  start_server_message: string | undefined
  stop_server_message: string | undefined
  start_compressing_files_message: string | undefined
  end_compressed_files_message: string | undefined
  gamertag_join_server_message: string | undefined
  gamertag_left_server_message: string | undefined
  version_download: string | undefined
  xuid_download: string | undefined
  download_button: string | undefined
  xuid_string: string | undefined
  looking_for_xuid_message: string | undefined
  checking_server_version_message: string | undefined
  not_up_to_date_server_message: string | undefined
  updated_server_message: string | undefined
  error_downloading_version_message: string | undefined
  error_getting_version_message: string | undefined
  deleted_oldest_version_success_message: string | undefined
  error_deleting_oldest_version_message: string | undefined
  watching_logging_message: string | undefined
  error_cant_get_last_item_message: string | undefined
  error_could_not_find_xuid_message: string | undefined
}

/**
 * Editable configuration for numbers.
 */
interface MinecraftNumbersInterface {
  max_number_files_in_downloads_folder: number
}

/**
 * Minecraft.
 *
 */
class Minecraft {
  // Options configuration
  private options: MinecraftOptionsInterface | any

  private logs_strings: any = {
    player_disconnected: '[INFO] Player disconnected:',
    player_connected: '[INFO] Player connected:',
  }

  private minecraft_screen_name: string = 'Minecraft'

  private discord_screen_name: string = 'Discord'

  private discord_instance: Discord

  /**
   * Constructor
   * @param options
   */

  constructor(options?: MinecraftOptionsInterface) {
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.OPTIONS_PATH || os.homedir() + '/MinecraftServer/',
        backup_path: process.env.BACKUP_PATH || os.homedir() + '/Backups/',
        download_path: process.env.DOWNLOAD_PATH || os.homedir() + '/downloads/',
        log_file: process.env.LOG_FILE || os.homedir() + '/MinecraftServer/minecraft-server.log',
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
          gamertag_join_server_message:
            process.env.options_gamertag_join_server_message || 'joined the Minecraft server.',
          gamertag_left_server_message:
            process.env.options_gamertag_left_server_message || 'left the Minecraft server.',
          version_download:
            process.env.options_versions_downloads || 'https://www.minecraft.net/en-us/download/server/bedrock/',
          xuid_download: process.env.options_xuid_download || 'https://cxkes.me/xbox/xuid',
          download_button: process.env.options_download_button || '[data-platform="serverBedrockLinux"]',
          xuid_string: process.env.options_xuid_string || '.col-md-8 div h1',
          looking_for_xuid_message: process.env.options_looking_for_xuid_message || 'Looking for xuid.',
          checking_server_version_message:
            process.env.options_checking_server_version_message || 'Checking latest version of Minecraft.',
          not_up_to_date_server_message:
            process.env.options_not_up_to_date_server_message ||
            'Server is not up to date. Updating server to latest version: ',
          updated_server_message: process.env.options_updated_server_message || 'Server is up to date.',
          error_downloading_version_message:
            process.env.options_error_downloading_version_message || 'An error occurred while downloading latest file.',
          error_getting_version_message:
            process.env.options_error_getting_version_message || 'An error occurred while getting latest version',
          deleted_oldest_version_success_message:
            process.env.options_deleted_oldest_version_success_message || 'Oldest file has been deleted: ',
          error_deleting_oldest_version_message:
            process.env.options_error_deleting_oldest_version_message ||
            'An error occurred while deleting the oldest file.',
          watching_logging_message: process.env.options_watching_logging_message || 'Watching for changes.',
          error_cant_get_last_item_message:
            process.env.options_error_cant_get_last_item_message || 'Error with getting last item in downloads folder.',
          error_could_not_find_xuid_message:
            process.env.options_error_could_not_find_xuid_message || 'Could not get xuid.',
        },
      }
    }

    this.discord_instance = new Discord()
  }

  /**
   * Start the execution.
   *
   */
  async restartServer() {
    try {
      // Sends a message to Discord that a backup has begun
      await this.discord_instance.sendMessageToDiscord(this.options.strings.pre_backup_message)

      // Stops Minecraft server
      await this.stopServer()

      // Starts Minecraft server
      await this.startServer()

      // Sends a message to Discord that backup is complete
      await this.discord_instance.sendMessageToDiscord(this.options.strings.post_backup_message)
    } catch (error) {
      // @ts-ignore
      logging(error)
    }
    return
  }

  /**
   * Starts the server using a screen command.
   *
   */
  async startServer() {
    // Backups Server
    this.backupServer()

    // Checks for latest version
    let versionLink: string | undefined = await this.checkForLatestVersion()

    // Checks if the server is outdated
    if (versionLink) {
      // Gets last item in Download Folder
      await this.getLastItemInDownload(versionLink)

      // Deletes oldest file if Download folder exceeds preferred capacity
      await this.deleteOldestFile()
    } else {
      logging(this.options.strings.error_getting_version_message)
    }

    // Starts a screen
    executeShellScript(
      `cd ${this.options.path} && screen -L -Logfile minecraft-server.log -dmS ${this.minecraft_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.path}bedrock_server" `,
    )

    // Sends message to Discord that server is starting up
    this.discord_instance.sendMessageToDiscord(this.options.strings.start_server_message)
  }

  /**
   * Commits backup to Git Repository.
   *
   */
  backupServer(): void {
    let date: Date = new Date()
    let script: string = `cd ${
      this.options.path
    } && git add . && git commit -m "Automatic Backup: ${date.toISOString()}" && git push`
    try {
      executeShellScript(script)
    } catch (error) {
      logging(this.options.strings.error_backup_message, error)
    }
  }

  /**
   * Checks for latest version.
   *
   */
  async checkForLatestVersion(): Promise<string> {
    try {
      logging(this.options.strings.checking_server_version_message)
      let downloadURL: string = this.options.strings.version_download

      const browser = await puppeteer.use(StealthPlugin()).launch({
        args: ['--no-sandbox'],
        executablePath: '/usr/bin/chromium-browser',
      })
      const page = await browser.newPage()
      await page.goto(downloadURL)

      const html = await page.content()
      const $: cheerio.Root = cheerio.load(html)

      const button: cheerio.Cheerio = $(this.options.strings.download_button)
      const buttonData: cheerio.Element = button[0]

      await browser.close()

      return Object.values(buttonData)[3].href || ''
    } catch (error) {
      logging(this.options.strings.error_getting_version_message, error)
    }

    return ''
  }

  /**
   * Get xuid from gamertag, using the website https://cxkes.me/xbox/xuid.
   *
   * @url https://cxkes.me/xbox/xuid
   *
   */
  async getXuidFromGamerTag(gamerTag: string = ''): Promise<string> {
    try {
      logging(this.options.strings.looking_for_xuid_message)
      let downloadURL: string = this.options.strings.xuid_download

      let args: any[] = []
      let executablePath

      if (process.platform !== 'darwin') {
        args = ['--no-sandbox']
        executablePath = '/usr/bin/chromium-browser'
      }
      const browser = await puppeteer.use(StealthPlugin()).launch({ headless: true, args, executablePath })
      const page = await browser.newPage()
      await page.goto(downloadURL)

      await page.click('.form-check-input[value="1"]')
      await page.focus('#gamertag')
      await page.keyboard.type(gamerTag)

      await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: 'networkidle0' })])

      const html = await page.content()
      const $: cheerio.Root = cheerio.load(html)

      const xuidPayload: cheerio.Cheerio = $(this.options.strings.xuid_string)
      // @ts-ignore
      const xuidString: string = xuidPayload[0].children[0].data

      if (xuidString) {
        logging(`Found xuid from gamertag. Gamertag: ${gamerTag}, xuid: ${xuidString}`)
      }

      await browser.close()

      return xuidString
    } catch (error) {
      logging(this.options.strings.error_could_not_find_xuid_message, error)
    }

    return ''
  }

  /**
   * Gets last item in Download Folder.
   *
   * @param versionLink The link of the latest version from the website.
   */
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
    } catch (error) {
      logging(this.options.strings.error_cant_get_last_item_message, error)
    }
  }

  /**
   * Updates Minecraft Server.
   *
   * @TODO: chmod -R 744 bedrock_server?
   *
   * @param versionLink The link of the latest version from the website.
   */
  updateServer(versionLink: string | undefined): void {
    try {
      const latestVersionZip: string | undefined =
        versionLink && versionLink.split('/')[versionLink.split('/').length - 1]
      logging(this.options.strings.not_up_to_date_server_message + latestVersionZip)

      // @TODO: We need to investigate proper permission and then add it in here.
      executeShellScript(
        `cd ${this.options.download_path} && ` +
          `wget ${versionLink} && ` +
          `cd ${this.options.path} && ` +
          `unzip -o "${this.options.download_path}${latestVersionZip}" -x "*server.properties*" "*permissions.json*" "*whitelist.json*" "*valid_known_packs.json*" && ` +
          `chmod 777 ${this.options.path}/bedrock_server`,
      )
    } catch (error) {
      logging(this.options.strings.error_downloading_version_message, error)
    }
  }

  /**
   * Deletes oldest file if Download folder exceeds preferred capacity.
   *
   */
  async deleteOldestFile(): Promise<void> {
    try {
      let files: Array<string> = await fs.readdir(this.options.download_path)
      const count: number = files.filter((item) => item.includes('zip')).length
      if (count > this.options.numbers.max_number_files_in_downloads_folder) {
        let oldFile: string = files[1]
        executeShellScript(`cd ${this.options.download_path} && rm ${oldFile}`)
        logging(this.options.strings.deleted_oldest_version_success_message + oldFile)
      }
    } catch (error) {
      logging(this.options.strings.error_deleting_oldest_version_message, error)
    }
  }

  /**
   * Stops the server.
   *
   */
  async stopServer() {
    logging(this.options.strings.stop_server_message)
    executeShellScript(`screen -S ${this.minecraft_screen_name} -X kill`)
    this.discord_instance.sendMessageToDiscord(this.options.strings.stop_server_message)
  }

  /**
   * Adding logging for Discord.
   *
   */
  async logs() {
    executeShellScript(
      `cd ${this.options.path} && screen -L -Logfile minecraft-discord.log -dmS ${this.discord_screen_name} /bin/zsh -c "LD_LIBRARY_PATH=${this.options.path} ${this.options.log_file}"`,
    )
    logging(this.options.strings.watching_logging_message)

    let file = await fs.readFile(this.options.log_file, 'utf8')
    let fileNumber = file.split(/\n/).length

    chokidar.watch(this.options.log_file).on('all', async (evt, path) => {
      if (evt === 'change') {
        let newFile = await fs.readFile(path, 'utf8')
        let newFileNumber = newFile.split(/\n/).length
        if (fileNumber < newFileNumber) {
          const element = newFile.split(/\n/)[newFileNumber - 2]

          if (element.includes(this.logs_strings.player_disconnected)) {
            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_disconnected)
            this.discord_instance.sendMessageToDiscord(
              gamerTag + ' ' + this.options.strings.gamertag_left_server_message,
            )
          } else if (element.includes(this.logs_strings.player_connected)) {
            const gamerTag = this.getGamerTagFromLog(element, this.logs_strings.player_connected)
            this.discord_instance.sendMessageToDiscord(
              gamerTag + ' ' + this.options.strings.gamertag_join_server_message,
            )
          }
        }

        fileNumber = newFile.split(/\n/).length
      }
    })
  }

  /**
   * Gets Gamertag from Log.
   *
   */
  getGamerTagFromLog(logString: string, logIndentifier: string): string {
    return logString.split(logIndentifier)[1].split(',')[0].split(' ')[1]
  }
}
export default Minecraft
