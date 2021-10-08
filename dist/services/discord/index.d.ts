/// <reference types="node" />
import { PathLike } from 'fs';
interface DiscordOptionsInterface {
    path: PathLike;
    log_file: string | undefined;
    whitelist_file: string;
    old_whitelist_file: string;
    discord_client: string | undefined;
    discord_role: string | undefined;
    discord_command: string | undefined;
    discord_id: string | undefined;
    discord_token: string | undefined;
    strings: DiscordStringsInterface;
}
interface DiscordStringsInterface {
    error_starting_discord_message: string;
    bot_is_online_message: string;
    sending_discord_message: string;
    error_discord_message: string;
    error_command: string;
    successful_command_message: string;
    invalid_permission_command: string;
    help_command_message: string;
    command_entered_message: string;
    successfully_added_user_message: string;
    successfully_removed_user_message: string;
    user_not_found_message: string;
    xuid_not_found_message: string;
    start_command: string;
    stop_command: string;
    restart_command: string;
    help_command: string;
    add_command: string;
    remove_command: string;
    start_command_description: string;
    stop_command_description: string;
    restart_command_description: string;
    help_command_description: string;
    add_command_description: string;
    remove_command_description: string;
}
declare class Discord {
    options: DiscordOptionsInterface;
    private client;
    private discord_screen_name;
    constructor(options?: DiscordOptionsInterface);
    sendMessageToDiscord(string: string): Promise<void>;
    startDiscord(): Promise<void>;
    startBot(): void;
    startMessages(): Promise<void>;
    startInteractions(): Promise<void>;
    loginClient(): Promise<void>;
}
export default Discord;
