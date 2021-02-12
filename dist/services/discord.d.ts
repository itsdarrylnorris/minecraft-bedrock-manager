import { Message } from 'discord.js';
interface DiscordOptionsInterface {
    message: Message;
}
declare class Discord {
    private options;
    constructor(options: DiscordOptionsInterface | any);
    startDiscord(): Promise<void>;
    startBot(): Promise<void>;
    startCommands(): Promise<void>;
    loginClient(): Promise<void>;
    logging: (message: string, payload?: any) => void;
}
export default Discord;
