// import fs from 'fs'
// import Discord from 'discord.js'
// import shell from 'shelljs'
// import zipper from 'zip-local'
import fs from 'fs'
import readline from 'readline'
const { google } = require('googleapis')
require('dotenv').config()

/**
 * Interface of Minecraft Manager.
 */
interface MineCraftManagerOptionsInterface {
  // Webhook string
  discord: MineCraftManagerDiscordInterface | undefined // Path of the location where all the files lives

  path: string | undefined // Any options to ensure we can support google drive backups. // @TODO: We need to change the any and past an interface here. Depending on what we need to for Google Drive.

  google_drive: any | undefined // Strings of whatever we are going to be posting at

  strings: MineCraftManagerStringsInterface // If set, we want to move the file into this location.

  backup_path: string | undefined
}

/**
 * Interface of Discord, it contains any information related to discord.
 */
interface MineCraftManagerDiscordInterface {
  webhook: string | undefined
  discordInfo: WebhookInterface
}

interface WebhookInterface {
  send: any
  id: string
  token: string
}

/**
 * Handling the strings as configuration so we can easily change them if needed.
 */
interface MineCraftManagerStringsInterface {
  pre_backup_message: string | undefined
  post_backup_message: string | undefined
  error_backup_message: string | undefined
}

/**
 * MineCraftManager Class.
 *
 */
class MineCraftManager {
  // Options config
  private options: MineCraftManagerOptionsInterface | any
  /**
   * Constructor
   * @param options
   */

  constructor(options: MineCraftManagerOptionsInterface | any) {
    if (options && options.path) {
      this.options = options
    } else {
      this.options = {
        path: process.env.options_path || '~/MinecraftServer/',
        backup_path: process.env.options_path || '~/Backups/',
        discordId: process && process.env && process.env.DISCORD_ID ? process.env.DISCORD_ID.toString() : '',
        discordToken: process && process.env && process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.toString() : '',
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

  async startBackup() {
    try {
      // Send message to Discord that we are starting
      await this.sendMessageToDiscord(this.options.strings.pre_backup_message) // Stopping server

      await this.stopMinecraftServer() // Compress the folder

      await this.compressFile() // Moving the backup to

      // await this.moveBackupToPath() // Upload backup to Google Drive

      await this.uploadBackupToGoogleDrive()

      await this.startMinecraftServer()
    } catch (e) {
      this.logging(e)
      this.sendMessageToDiscord(this.options.strings.post_backup_message)
    }
  }
  /**
   * Moves the compress backup file into this.options.backup_path
   */

  // async moveBackupToPath() {
  //   this.logging(`Moving backup to ${this.options.backup_path}`)
  //   let currentPath: string = this.options.path
  //   let backupPath: string = this.options.backup_path
  //   try {
  //     const status = shell.mv(currentPath, backupPath)
  //     if (status.stderr) console.log(status.stderr)
  //     else console.log('File moved!')
  //   } catch (err) {
  //     console.error(err)
  //   }
  //   this.logging(`Done moving backup to ${this.options.backup_path}`)
  // }
  /**
   * Starts the server using screen command.
   *
   * This might be a bit tricky because of screen; however we can try this: https://stackoverflow.com/questions/24706815/how-do-i-pass-a-command-to-a-screen-session
   *
   *
   *
   */

  async startMinecraftServer() {
    // You should use https://www.npmjs.com/package/shelljs
    // LD_LIBRARY_PATH=. ./bedrock_server
    // @TODO: Skip this if we are on dev?
    // Darryl stuff
  }
  /**
   * It uses Shelljs to kill all the screens.
   *
   */

  async stopMinecraftServer() {
    this.logging('Stopping server') // You should use https://www.npmjs.com/package/shelljs // killall screen // @TODO: Skip this if we are on dev? // Darryl stuff
  }
  /**
   * Compress the file from this.options.path
   */

  async compressFile() {
    this.logging('Compressing file')
    // Why does this.option.path not work
    // let currentPath: string = this.options.path

    // Why does this string work
    // let currentPath: string = '/Users/mandyhom/MinecraftServer'
    // let backupPath: string = this.options.backup_path
    // let date = new Date()

    // try {
    //   shell.cd(backupPath)
    //   await zipper.sync
    //     .zip(currentPath)
    //     .compress()
    //     .save(`${date.toISOString()}-minecraft.zip`)

    // } catch (err) {
    //   console.log(err)
    // }

    this.logging('Done Compressing file. Deleted MinecraftServer Folder')
  }
  /**
   * Sends a message to Discord
   * @param string
   * @url https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
   */

  async sendMessageToDiscord(string: string) {
    this.logging('Sending this message to discord', string)
    // try {
    //   const webhook: WebhookInterface = new Discord.WebhookClient(discordId, discordToken)
    //   await webhook.send('We are shutting down the server temporary, we are making a backup.')
    // } catch (err) {
    //   console.log(err)
    // }
  }
  /**
   * Upload backup file to Google Drive
   */

  async uploadBackupToGoogleDrive() {
    const SCOPES = ['https://www.googleapis.com/auth/drive']
    const TOKEN_PATH = 'token.json'

    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err)
      authorize(JSON.parse(content.toString()), storeFiles)
    })

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials: any, callback: any) {
      const { client_secret, client_id, redirect_uris } = credentials.installed
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.stringify(token))
        console.log(oAuth2Client.refreshTokenPromises)
        callback(oAuth2Client)
      })
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client: any, callback: any) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      })
      console.log('Authorize this app by visiting this url:', authUrl)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      rl.question('Enter the code from that page here: ', code => {
        rl.close()
        oAuth2Client.getToken(code, (err: any, token: any) => {
          if (err) return console.error('Error retrieving access token', err)
          oAuth2Client.setCredentials(token)
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
            if (err) return console.error(err)
            console.log('Token stored to', TOKEN_PATH)
          })
          callback(oAuth2Client)
        })
      })
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function storeFiles(auth: any) {
      const drive = google.drive({ version: 'v3', auth })
      var fileMetadata = {
        name: 'ImageTest.jpeg',
      }
      var media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream('/Users/mandyhom/Pictures/Me1.jpg'),
      }
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: 'id',
        },
        function(err: any, file: any) {
          if (err) {
            // Handle error
            console.error(err)
          } else {
            console.log('File Id: ', file.data.id)
          }
        },
      )
    }
    this.logging('Saving backup in Google Drive')
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

const minecraft = new MineCraftManager({})

minecraft.startBackup()
