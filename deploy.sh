#!/bin/zsh
echo "Starting deployment...🚀";
cd ~/Projects/minecraft-manager;
echo "Removing logs...🗑️";
rm -rf ./logs/*.logs;
echo "Pulling code...🔥"
git pull;
echo "Deployment complete...😚"

