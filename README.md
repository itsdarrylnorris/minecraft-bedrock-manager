# Minecraft Manager

Minecraft Manager helps backup your Minecraft server by storing backups of your server to Google Drive as zip files while alerting your Discord Community that a backup is underway.

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

# Usage
