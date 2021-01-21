interface MineCraftManagerOptionsInterface {
    discord: MineCraftManagerDiscordInterface | undefined;
    path: string | undefined;
    google_drive: any | undefined;
    strings: MineCraftManagerStringsInterface;
    backup_path: string | undefined;
}
interface MineCraftManagerDiscordInterface {
    webhook: string | undefined;
}
interface MineCraftManagerStringsInterface {
    pre_backup_message: string | undefined;
    post_backup_message: string | undefined;
    error_backup_message: string | undefined;
}
declare class MineCraftManager {
    private options;
    constructor(options: MineCraftManagerOptionsInterface | any);
    startBackup(): Promise<void>;
    moveBackupToPath(): Promise<void>;
    startMinecraftServer(): Promise<void>;
    stopMinecraftServer(): Promise<void>;
    compressFile(): Promise<void>;
    sendMessageToDiscord(string: string): Promise<void>;
    uploadBackupToGoogleDrive(): Promise<void>;
    logging: (message: string, payload?: any) => void;
}
declare const minecraft: MineCraftManager;
