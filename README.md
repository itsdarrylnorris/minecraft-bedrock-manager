# Minecraft Manager

Minecraft Manager helps backup your Minecraft server by storing backups of your server as zip files, sending Discord messages that a backup is underway, and sending custom messages to your Discord Community.

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
4. Click on the **General Information** Section and copy your applications' **Client ID**, located below the applications' title and description.
5. Go to this [Discord Permissions Calculator](https://discordapi.com/permissions.html) website and click on whatever permissions necessary.
6. Paste the copied **Client ID** into the **Client ID** field.
7. Click on the **Link** provided and you will be redirected to a Discord authorization page.
8. Select your Server and select **Continue**.
9. Double check the Bot's permissions and click on **Authorize**.

# Usage
