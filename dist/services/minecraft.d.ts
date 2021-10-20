interface MinecraftOptionsInterface {
    path: string | undefined;
    backup_path: string | undefined;
    download_path: string | undefined;
    log_file: string | undefined;
    strings: MinecraftStringsInterface;
    numbers: MinecraftNumbersInterface;
}
interface MinecraftStringsInterface {
    pre_backup_message: string | undefined;
    post_backup_message: string | undefined;
    error_backup_message: string | undefined;
    start_server_message: string | undefined;
    stop_server_message: string | undefined;
    start_compressing_files_message: string | undefined;
    end_compressed_files_message: string | undefined;
    gamertag_join_server_message: string | undefined;
    gamertag_left_server_message: string | undefined;
    version_download: string | undefined;
    xuid_download: string | undefined;
    download_button: string | undefined;
    xuid_string: string | undefined;
    looking_for_xuid_message: string | undefined;
    checking_server_version_message: string | undefined;
    not_up_to_date_server_message: string | undefined;
    updated_server_message: string | undefined;
    error_downloading_version_message: string | undefined;
    error_getting_version_message: string | undefined;
    deleted_oldest_version_success_message: string | undefined;
    error_deleting_oldest_version_message: string | undefined;
    watching_logging_message: string | undefined;
    error_cant_get_last_item_message: string | undefined;
    error_could_not_find_xuid_message: string | undefined;
}
interface MinecraftNumbersInterface {
    max_number_files_in_downloads_folder: number;
}
declare class Minecraft {
    private options;
    private logs_strings;
    private minecraft_screen_name;
    private discord_screen_name;
    private discord_instance;
    constructor(options?: MinecraftOptionsInterface);
    restartServer(): Promise<void>;
    startServer(): Promise<void>;
    backupServer(): void;
    checkForLatestVersion(): Promise<string>;
    getXuidFromGamerTag(gamerTag?: string): Promise<string>;
    getLastItemInDownload(versionLink: string | undefined): Promise<void>;
    updateServer(versionLink: string | undefined): void;
    deleteOldestFile(): Promise<void>;
    stopServer(): Promise<void>;
    runLogs(): Promise<void>;
    logs(): Promise<void>;
    getGamerTagFromLog(logString: string, logIndentifier: string): string;
}
export default Minecraft;
