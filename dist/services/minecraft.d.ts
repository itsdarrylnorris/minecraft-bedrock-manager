import { ShellString } from 'shelljs';
interface MinecraftOptionsInterface {
    discord: MinecraftDiscordInterface | undefined;
    path: string | undefined;
    strings: MinecraftStringsInterface;
    backup_path: string | undefined;
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
interface MinecraftStringsInterface {
    pre_backup_message: string | undefined;
    post_backup_message: string | undefined;
    error_backup_message: string | undefined;
    start_server_message: string | undefined;
    stop_server_message: string | undefined;
    start_compressing_files_message: string | undefined;
    end_compressed_files_message: string | undefined;
    sending_discord_message: string | undefined;
    error_discord_message: string | undefined;
    gamertag_join_server_message: string | undefined;
    gamertag_left_server_message: string | undefined;
}
declare class Minecraft {
    private options;
    private logs_strings;
    private minecraft_screen_name;
    constructor(options: MinecraftOptionsInterface | any);
    restartServer(): Promise<void>;
    startServer(): Promise<void>;
    backupServer(): Promise<void>;
    stopServer(): Promise<void>;
    executeShellScript(string: string): ShellString | undefined;
    sendMessageToDiscord(string: string): Promise<void>;
    logs(): Promise<void>;
    getGamerTagFromLog(logString: string, logIndentifier: string): string;
}
export default Minecraft;
