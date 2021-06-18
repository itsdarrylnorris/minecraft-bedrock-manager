import { Message } from 'discord.js';
interface DiscordOptionsInterface {
    message: Message;
    discord: MinecraftDiscordInterface | undefined;
    sending_discord_message: string | undefined;
    error_discord_message: string | undefined;
}
interface MinecraftDiscordInterface {
    webhook: string | undefined;
    discord_info: WebhookInterface;
}
interface WebhookInterface {
    send: any;
    id: string;
    token: string;
}
declare class Discord {
    private options;
    private client;
    private discord_screen_name;
    static Client: any;
    constructor(options: DiscordOptionsInterface | any);
    sendMessageToDiscord(string: string): Promise<void>;
    startDiscord(): Promise<void>;
    startBot(): void;
    startCommands(): Promise<void>;
    loginClient(): Promise<void>;
}
export default Discord;
