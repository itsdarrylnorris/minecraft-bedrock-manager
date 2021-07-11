import { Message } from 'discord.js';
interface DiscordOptionsInterface {
    message: Message;
    discord: MinecraftDiscordInterface | undefined;
    path: string | undefined;
    log_file: string | undefined;
    whitelist_file: string | undefined;
    old_whitelist_file: string | undefined;
    discord_client: string | undefined;
    discord_role: string | undefined;
    discord_command: string | undefined;
    discord_id: string | undefined;
    discord_token: string | undefined;
    strings: DiscordStringsInterface;
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
interface DiscordStringsInterface {
    sending_discord_message: string | undefined;
    error_discord_message: string | undefined;
    successful_command: string | undefined;
    error_command: string | undefined;
    invalid_permission_command: string | undefined;
    help_command_message: string | undefined;
    command_entered_message: string | undefined;
    successfully_added_user_message: string | undefined;
    successfully_removed_user_message: string | undefined;
    user_not_found: string | undefined;
    start_command: string | undefined;
    stop_command: string | undefined;
    restart_command: string | undefined;
    help_command: string | undefined;
    add_command: string | undefined;
    remove_command: string | undefined;
}
declare class Discord {
    private options;
    private client;
    private discord_screen_name;
    constructor(options: DiscordOptionsInterface | any);
    sendMessageToDiscord(string: string): Promise<void>;
    startDiscord(): Promise<void>;
    startBot(): void;
    startCommands(): Promise<void>;
    loginClient(): Promise<void>;
}
export default Discord;
