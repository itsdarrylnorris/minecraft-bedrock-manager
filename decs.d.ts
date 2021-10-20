import 'discord.js'
declare module 'discord.js' {
  export interface Client {
    commands: any
  }
}
