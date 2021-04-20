interface MinecraftOptionsInterface {
    discord: MinecraftDiscordInterface | undefined;
    path: string | undefined;
    strings: MinecraftStringsInterface;
    backup_path: string | undefined;
    download_path: string | undefined;
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
    max_number_files_in_downloads_folder: number;
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
    version_download: string | undefined;
    download_button: string | undefined;
    not_up_to_date_server_message: string | undefined;
    updated_server_message: string | undefined;
    error_downloading_version: string | undefined;
    deleted_oldest_version_success: string | undefined;
    error_deleting_oldest_version: string | undefined;
}
declare class Minecraft {
    private options;
    private logs_strings;
    private minecraft_screen_name;
    constructor(options: MinecraftOptionsInterface | any);
    restartServer(): Promise<void>;
    startServer(): Promise<void>;
    backupServer(): Promise<void>;
    checkForLatestVersion(): Promise<string | undefined>;
    getLastItemInDownload(versionLink: string | undefined): Promise<void>;
    updateServer(versionLink: string | undefined): Promise<void>;
    deleteOldestFile(): Promise<void>;
    stopServer(): Promise<void>;
    sendMessageToDiscord(string: string): Promise<void>;
    logs(): Promise<void>;
    getGamerTagFromLog(logString: string, logIndentifier: string): string;
}
export default Minecraft;
