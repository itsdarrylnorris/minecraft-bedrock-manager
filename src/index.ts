import program from 'commander'
import Discord from './services/discord'
import Minecraft from './services/minecraft'

program.version('0.0.1')

program
  .option('-s, --start-server', 'Start the Minecraft Server')
  .option('-r, --restart-server', 'Restarts the Minecraft Server')
  .option('-st, --stop-server', 'Stop Minecraft Server')
  .option('-l, --logs', 'Show the Minecraft Logs')
  .option('-d, --discord', 'Start Discord')

program.parse(process.argv)

const options = program.opts()

if (options.startServer) {
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
