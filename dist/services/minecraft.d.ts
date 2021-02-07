interface MinecraftOptionsInterface {
    discord: MinecraftDiscordInterface | undefined;
    path: string | undefined;
    google_drive: any | undefined;
    strings: MinecraftStringsInterface;
    backup_path: string | undefined;
}
interface MinecraftDiscordInterface {
    webhook: string | undefined;
    discordInfo: WebhookInterface;
}
interface WebhookInterface {
    send: any;
    id: string;
    token: string;
}
interface MinecraftStringsInterface {
    pre_backup_message: string | undefined;
    post_backup_message: string | undefined;
    error_backup_message: string | undefined;
}
declare class Minecraft {
    private options;
    private logs_strings;
    constructor(options: MinecraftOptionsInterface | any);
    restartServer(): Promise<void>;
    startServer(): Promise<void>;
    stopServer(): Promise<void>;
    compressFile(): Promise<void>;
    sendMessageToDiscord(string: string): Promise<void>;
    logs(): Promise<void>;
    getGamerTagFromLog(logString: string, logIndentifier: string): string;
    logging: (message: string, payload?: any) => void;
}
export default Minecraft;
