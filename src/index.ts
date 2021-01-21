/**
 * Interface of Minecraft Manager.
 */
interface MineCraftManagerOptionsInterface {
  // Webhook string
  discord: MineCraftManagerDiscordInterface | undefined

  // Path of the location where all the files lives
  path: string | undefined

  // Any options to ensure we can support google drive backups.
  // @TODO: We need to change the any and past an interface here. Depending on what we need to for Google Drive.
  google_drive: any | undefined

  // Strings of whatever we are going to be posting at
  strings: MineCraftManagerStringsInterface

  // If set, we want to move the file into this location.
  backup_path: string | undefined
}

/**
 * Interface of Discord, it contains any information related to discord.
 */
interface MineCraftManagerDiscordInterface {
  webhook: string | undefined
  // @TODO Any other extra information?
}

/**
 * Handling the strings as configuration so we can easily change them if needed.
 */
interface MineCraftManagerStringsInterface {
  pre_backup_message: string | undefined
  post_backup_message: string | undefined
  error_backup_message: string | undefined
}

/**
 * MineCraftManager Class.
 *
 */
class MineCraftManager {
  // Options config
  private options: MineCraftManagerOptionsInterface | any

  /**
   * Constructor
   * @param options
   */
  constructor(options: MineCraftManagerOptionsInterface | any) {
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.options_path || '~/MinecraftServer/',
        backup_path: process.env.options_path || '~/Backups/',
        strings: {
          pre_backup_message:
            process.env.options_pre_backup_message ||
            'We are shutting down the server temporary, we are making a backup.',
          post_backup_message:
            process.env.options_post_backup_message || 'We are done with the backup, the server is back on.',
          error_backup_message: process.env.options_error_backup_message || 'Something went wrong build out the backup',
        },
      }
    }
  }

  /**
   * Start the execution.
   */
  async startBackup() {
    try {
      // Send message to Discord that we are starting
      await this.sendMessageToDiscord(this.options.strings.pre_backup_message)

      // Stoping server
      await this.stopMinecraftServer()

      // Compress the folder
      await this.compressFile()

      // Moving the backup to
      await this.moveBackupToPath()

      // Upload backup to Google Drive
      await this.uploadBackupToGoogleDrive()

      await this.startMinecraftServer()
    } catch (e) {
      this.logging(e)
      this.sendMessageToDiscord(this.options.strings.post_backup_message)
    }
  }

  /**
   * Moves the compress backup file into this.options.backup_path
   */
  async moveBackupToPath() {
    this.logging(`Moving backup to ${this.options.backup_path}`)
    // @TODO: Move file? Maybe just mv
    this.logging(`Done moving backup to ${this.options.backup_path}`)
  }

  /**
   * Starts the server using screen command.
   *
   * This might be a bit tricky because of screen; however we can try this: https://stackoverflow.com/questions/24706815/how-do-i-pass-a-command-to-a-screen-session
   *
   *
   *
   */
  async startMinecraftServer() {
    // You should use https://www.npmjs.com/package/shelljs
    // LD_LIBRARY_PATH=. ./bedrock_server
    // @TODO: Skip this if we are on dev?
  }

  /**
   * It uses Shelljs to kill all the screens.
   *
   */
  async stopMinecraftServer() {
    this.logging('Stopping server')
    // You should use https://www.npmjs.com/package/shelljs

    // killall screen
    // @TODO: Skip this if we are on dev?
  }

  /**
   * Compress the file from this.options.path
   */
  async compressFile() {
    this.logging('Compressing file')
    // @TODO: Add logic to compress file
    // The location of the file is at this.option.path
    this.logging('Done Compressing file')
  }

  /**
   * Sends a message to Discord
   * @param string
   * @url https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
   */
  async sendMessageToDiscord(string: string) {
    this.logging('Sending this message to discord', string)
    // @TODO Add logic to send Discord message
  }

  /**
   * Upload backup file to Google Drive
   */
  async uploadBackupToGoogleDrive() {
    this.logging('Saving backup in Google Drive')
  }

  /**
   * Logging wrapper around console.log with timestamps.
   *
   */
  logging = (message: string, payload: any = null) => {
    var date = new Date()

    console.log(`[${date.toISOString()}] ${message}`)

    if (payload) {
      if (typeof payload === 'string' || payload instanceof String) {
        console.log(`[${date.toISOString()}] ${payload}`)
      } else {
        console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`)
      }
    }
  }
}

const minecraft = new MineCraftManager({})

minecraft.startBackup()
