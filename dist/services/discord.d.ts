import { Message } from 'discord.js';
interface DiscordOptionsInterface {
    message: Message;
}
declare class Discord {
    private options;
    private logging;
    private client;
    constructor(options: DiscordOptionsInterface | any);
    startDiscord(): Promise<void>;
    startBot(): Promise<void>;
    startCommands(): Promise<void>;
    loginClient(): Promise<void>;
}
export default Discord;
