import chalk from 'chalk'
import program from 'commander'
import figlet from 'figlet'
import Discord from './services/discord'
import Minecraft from './services/minecraft'

program.version('0.0.1')

program
  .option('-h, --help', 'Display help commands')
  .option('-s, --start-server', 'Starts the Minecraft Server')
  .option('-r, --restart-server', 'Restarts the Minecraft Server')
  .option('-st, --stop-server', 'Stops Minecraft Server')
  .option('-l, --logs', 'Shows the Minecraft Logs')
  .option('-d, --discord', 'Starts Discord')

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
    const minecraft = new Minecraft({})
    await minecraft.startServer()
    process.exit()
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
    const minecraft = new Discord({})
    minecraft.startDiscord()
  }
}

main()
