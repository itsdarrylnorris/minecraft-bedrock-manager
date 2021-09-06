import chalk from 'chalk'
import program from 'commander'
import figlet from 'figlet'
import Discord from './services/discord'
import Minecraft from './services/minecraft'
import { logging } from './utils'

program.version('0.0.1')

program
  .option('-h, --help', 'Display help commands')
  .option('-s, --start-server', 'Starts the Minecraft Server')
  .option('-r, --restart-server', 'Restarts the Minecraft Server')
  .option('-st, --stop-server', 'Stops Minecraft Server')
  .option('-l, --logs', 'Shows the Minecraft Logs')
  .option('-d, --discord', 'Starts Discord')
  .option('-b, --backup', 'Backup')
  .option('-sa, --start-all, Start Everything')
  .option('-x, --xuid, Find xuid from gamertag')

program.parse(process.argv)

const main = async () => {
  const options = program.opts()
  // Check the program.args obj
  const NO_COMMAND_SPECIFIED = Object.keys(options).length === 0

  // Handle it however you like
  if (NO_COMMAND_SPECIFIED || options.help) {
    console.log(chalk.bgHex('#52307c').bold(figlet.textSync('minecraft-manager', { horizontalLayout: 'full' })))
    // e.g. display usage
    program.help()
  } else if (options.startServer) {
    try {
      const minecraft = new Minecraft({})
      await minecraft.startServer()
      process.exit()
    } catch (error) {
      logging('Error:', error)
    }
  } else if (options.restartServer) {
    const minecraft = new Minecraft({})
    await minecraft.restartServer()
    process.exit()
  } else if (options.stopServer) {
    const minecraft = new Minecraft({})
    await minecraft.stopServer()
    process.exit()
  } else if (options.logs) {
    const minecraft = new Minecraft({})
    minecraft.logs()
  } else if (options.discord) {
    const discord = new Discord({})
    discord.startDiscord()
  } else if (options.backup) {
    try {
      const minecraft = new Minecraft({})
      minecraft.backupServer()
    } catch (error) {
      logging('Error:', error)
    }
  } else if (options.xuid) {
    try {
      if (process.argv[3]) {
        const minecraft = new Minecraft({})
        await minecraft.getXuidFromGamerTag(process.argv[3])
        process.exit()
      } else {
        logging('Missing gamertag. Please add gamertag after the --xuid')
      }
    } catch (error) {
      logging('Error:', error)
    }
  } else if (options.startAll) {
    try {
      const minecraft = new Minecraft({})
      await minecraft.startServer()
      const discord = new Discord({})
      discord.startDiscord()
      process.exit()
    } catch (error) {
      logging('Error', error)
    }
  }
}

main()
