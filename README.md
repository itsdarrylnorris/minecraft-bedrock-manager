# Minecraft Bedrock Manager

Minecraft Bedrock Manager lets you store backups of your server in a Git repository, send Discord messages that a backup is underway, and provides Slash Commands that lets you manage your server.

| :warning: | This project is still under development. Use it at your own risk. A lot of things are going to change :). |
| :-------: | :-------------------------------------------------------------------------------------------------------- |

- [Building](#building)
- [Installation](#installation)
  - [Setting up your Discord Webhook](#setting-up-your-discord-webhook)
  - [Setting up your Discord Application's Bot](#setting-up-your-discord-applications-bot)
  - [Setting up your .env file](#setting-up-your-env-file)
  - [Example of .env file](#example-of-env-file)
  - [Setting up your .gitignore file in local and production environment](#setting-up-your-gitignore-file-in-local-and-production-environment)
  - [Setting up your Git repository](#setting-up-your-git-repository)
- [Usage](#usage)
- [How to use the logs](#how-to-use-the-logs)
- [Available Commands](#available-commands)

# Building

### To run compile code:

```
yarn start
```

### Build and execute:

```
yarn dev
```

### To deploy the code:

```
yarn deploy
```

# Installation

## Setting up your Discord Webhook

1. Follow the instructions outlined under **MAKING A WEBHOOK** in this [article](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).
2. Press on **Copy Webhook URL**
3. Paste the copied URL into your browser's search bar.
4. Locate the webhook's id and token values.
5. Copy and paste the webhook id to the WEBHOOK_ID in your .env file.
6. Copy and paste the webhook id to the WEBHOOK_TOKEN in your .env file.

## Setting up your Discord Application's Bot

1. Go to this [website](https://discord.com/developers/applications) and click on **New Application**.
2. Enter your applications' name and click on **Create**.
3. Click on the **Bot** Section and click **Add Bot** to create a bot.
4. Copy the Bot's Token by clicking on **Copy** and paste to the DISCORD_CLIENT in your .env file.
5. Click on the **General Information** Section and copy your applications' **Client ID**, located below the applications' title and description.
6. Go to this [Discord Permissions Calculator](https://discordapi.com/permissions.html) website and click on whatever permissions necessary.
7. Paste the copied **Client ID** into the **Client ID** field.
8. Click on the **Link** provided and you will be redirected to a Discord authorization page.
9. Select your Server and select **Continue**.
10. Double check the Bot's permissions and click on **Authorize**.
11. Go back to this [website](https://discord.com/developers/applications) and click on **oAuth2**
12. Scroll down and locate the **oAuth2 URL Generator** heading.
13. Locate the **applications.commands** scope and mark the scope.
14. Click on the **Copy** button that contains the URL and paste that URL into your browser. Press Enter to view the URL.
15. Select your server and click on **Authorize**.

## Setting up your .env file

Your .env file must contain the following:

#### GUILD_ID

[Enable developer mode in your Discord server.](https://www.thewindowsclub.com/wp-content/uploads/2021/08/Discord-Turn-on-Developer-Mode.png) Then, right click on your server's name on the top left corner in Discord. Click on **Copy ID** and use the copied value as your GUILD_ID.

#### BOT_TOKEN

Go to this [website](https://discord.com/developers/applications) and click on **Bot**. Locate your Bot's Token and click on **Copy**. Use the copied value as your BOT_TOKEN.

#### CLIENT_ID

Go to this [website](https://discord.com/developers/applications) and click on **oAuth2**. Locate your Client ID (under Client Information) and click on **Copy**. Use the copied value as your CLIENT_ID.

#### DISCORD_ROLE

Add all the Discord server's roles that will have access to the Discord commands.

#### DISCORD_COMMAND

Add your preferred text to start the Discord command. Add the text after the Discord Prefix. Example: **mbm** add [Gamertag]

#### ENVIRONMENT

Configure the ENVIRONMENT value to either Development or Production

## Example of .env file

```
WEBHOOK_ID=[Webhook ID]
WEBHOOK_TOKEN=[Webhook Token]
GUILD_ID=[Guild ID]
BOT_TOKEN=[Bot Token]
CLIENT_ID=[Client Id]
DISCORD_ROLE="Devs, Admin"
DISCORD_COMMAND=mbm
ENVIRONMENT=PRODUCTION
```

## Setting up your .gitignore file in local and production environment

Add the following:

```
Dedicated_Server.txt
bedrock_server
bedrock_server_how_to.html
definitions
development_behavior_packs
development_resource_packs
development_skin_packs
install.sh
libCrypto.so
minecraft-server-activity.log
minecraft-server.log
minecraftbe
minecraftpe
premium_cache
release-notes.txt
snap
structures
treatments
world_templates

#### The keepers
# whitelist.json
# worlds
# server.properties
# behavior_packs
# resource_packs
# permissions.json
# valid_known_packs.json
####
```

## Setting up your Git repository

Blah

# Usage

### Requires Node version v16.8.0

### Deploy Discord Command Required After Any Slash Command Name Change

Any time you change the Discord Slash Command string configuration, you will need to use the Deploy Discord Command (-dc, --deploy-commands) to register the commands. If not used, your changes will not be registered.

# How to use the logs

Blah

# Available Commands

- Display Help Commands (-h, --help)
- Starts the Minecraft Server (-s, --start-server)
- Restarts the Minecraft Server (-r, --restart-server)
- Stops Minecraft Server (-st, --stop-server)
- Shows the Minecraft Logs (-l, --logs)
- Starts the Discord Bot (-d, --discord)
- Deploy Discord Commands (-dc, --deploy-commands)
- Backup the Minecraft Server (-b, --backup)
- Start Everything (-sa, --start-all)
- Find XUID From Gamertag (-x, --xuid)
- Run Minecraft Logs on Screen (-rl, --run-logs)
