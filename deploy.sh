#!/bin/zsh
echo "Starting deployment...🚀";
cd ~/Projects/minecraft-manager;
echo "Pulling code...🔥"
# TODO: Adding support to run yarn? To check dependencies?
git pull;
# Handing dependecies
echo "Checking for dependencies..."
yarn
echo "Deployment complete...😚"

