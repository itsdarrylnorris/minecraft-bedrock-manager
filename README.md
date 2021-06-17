# Minecraft Manager

Minecraft Manager helps backup your Minecraft server by storing backups of your server as zip files, sending Discord messages that a backup is underway, and sending custom messages to your Discord Community. 


:warning: | This project still under active development; use it at your own risk. A lot things are going to change :).
:---: | :---





- [Building](#building)
- [Installation](#installation)
- [Usage](#usage)

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

### Setting up your Discord Webhook

1. Follow the instructions outlined under **MAKING A WEBHOOK** in this [article](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).
2. Press on **Copy Webhook URL**
3. Paste the copied URL into your browser's search bar.
4. Locate the webhook's id and token values.
5. Copy and paste the webhook id to the DISCORD_ID in your .env file.
6. Copy and paste the webhook token to the DISCORD_TOKEN in your .env file.

For local development you can use these credentials

```
DISCORD_ID="807879959074832415"
DISCORD_TOKEN="0FEXP3YxCCU1z_FnwPHLMb-q0ZquR2wHKziHn1IkQxe3RD-KvyCGIFG2VHbZkF8ZsDem"
```

### Setting up your Discord Application's Bot

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

### Additional set up for your .env file

If you have followed the instructions starting from the top, you should have the following so far:

- DISCORD_ID
- DISCORD_TOKEN
- DISCORD_CLIENT

You will also need to add:

- DISCORD_ROLE

Add all the Discord server's roles that will have access to the Discord commands.

- DISCORD_PREFIX

Add your preferred prefix to start the Discord command. Example: **/** mm start server

- DISCORD_COMMAND

Add your preferred text to start the Discord command. Add the text after the Discord Prefix. Example: /**mm** start server

- ENVIRONMENT

Configure the environment value to either Development or Production

Example of .env file:

```
DISCORD_ID=[Discord ID]
DISCORD_TOKEN=[Discord Token]
DISCORD_CLIENT=[Discord Client]
DISCORD_ROLE="Devs, Admin"
DISCORD_PREFIX=/
DISCORD_COMMAND=mm
ENVIRONMENT=DEVELOPMENT
```

### Setting up your .gitignore file in local and production environment

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

### Setting up your GitHub Repository

# Usage

# TODO How to use the logs
