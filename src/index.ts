import chalk from 'chalk'
import program from 'commander'
import figlet from 'figlet'
import Discord from './services/discord'
import Minecraft from './services/minecraft'

program.version('0.0.1')

program
  .option('-h, --help', 'Display help for command')
  .option('-s, --start-server', 'Start the Minecraft Server')
  .option('-r, --restart-server', 'Restarts the Minecraft Server')
  .option('-st, --stop-server', 'Stop Minecraft Server')
  .option('-l, --logs', 'Show the Minecraft Logs')
  .option('-d, --discord', 'Start Discord')

program.parse(process.argv)

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
  minecraft.startServer()
  process.exit()
} else if (options.restartServer) {
  const minecraft = new Minecraft({})
  minecraft.restartServer()
} else if (options.stopServer) {
  const minecraft = new Minecraft({})
  minecraft.stopServer()
} else if (options.logs) {
  const minecraft = new Minecraft({})
  minecraft.logs()
} else if (options.discord) {
  const minecraft = new Discord({})
  minecraft.startDiscord()
}
