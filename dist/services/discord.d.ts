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
    client_id: string | undefined;
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
    command_entered_message: string;
    successfully_added_user_message: string;
    successfully_removed_user_message: string;
    user_not_found_message: string;
    xuid_not_found_message: string;
    error_with_adding_xuid_to_whitelist: string;
    error_with_removing_xuid_from_whitelist: string;
    error_with_start_command: string;
    error_with_stop_command: string;
    error_with_restart_command: string;
    error_with_help_command: string;
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
    successfully_deployed_commands: string;
    error_with_deploying_commands: string;
}
declare class Discord {
    options: DiscordOptionsInterface;
    private client;
    private discord_screen_name;
    constructor(options?: DiscordOptionsInterface);
    sendMessageToDiscord(string: string): Promise<void>;
    startDiscord(): Promise<void>;
    deployCommands(): Promise<void>;
    startBot(): void;
    startMessages(): Promise<void>;
    startInteractions(): Promise<void>;
    loginClient(): Promise<void>;
    deploy(): Promise<void>;
}
export default Discord;
