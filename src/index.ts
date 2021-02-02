import program from 'commander'
import Minecraft from './services/minecraft'

program.version('0.0.1')

program
  .option('-s, --start-server', 'Start the Minecraft Server')
  .option('-r, --restart-server', 'Restarts the Minecraft Server')
  .option('-st, --stop-server', 'Stop Minecraft Server')
  .option('-l, --logs', 'Show the Minecraft Logs')

program.parse(process.argv)

const options = program.opts()

if (options.startServer) {
  const minecraft = new Minecraft({})
  minecraft.startServer()
} else if (options.restartServer) {
  const minecraft = new Minecraft({})
  minecraft.startServer()
} else if (options.stopServer) {
  const minecraft = new Minecraft({})
  minecraft.startServer()
} else if (options.logs) {
  const minecraft = new Minecraft({})
  minecraft.logs()
}
