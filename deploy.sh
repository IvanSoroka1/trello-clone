#!/bin/bash
set -e

cd /home/ec2-user/trello-clone

# Pull latest changes
git fetch --all
git reset --hard origin/main  # or whatever branch you deploy

# Build frontend
cd client   # adjust if needed
npm ci        # clean install if dependencies changed
npm run build

# Copy to Nginx directory
#sudo rm -rf /var/www/your-app/dist/*
#sudo cp -r dist/* /var/www/your-app/dist/

# Reload nginx
sudo systemctl reload nginx
