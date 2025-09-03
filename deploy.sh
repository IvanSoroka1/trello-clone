#!/bin/bash
set -e

cd /home/ec2-user/trello-clone

# Ensure we're on main and reset to remote
git fetch origin main
git checkout main
git reset --hard origin/main   # force local branch to match remote

# Build frontend
cd client   # adjust if needed
npm ci        # clean install if dependencies changed
npm run build

# Copy to Nginx directory
#sudo rm -rf /var/www/your-app/dist/*
#sudo cp -r dist/* /var/www/your-app/dist/

# Reload nginx
sudo systemctl reload nginx

echo "Building Docker image..."
docker build -t my-backend ../server

echo "Stopping old container..."
docker stop backend || true

echo "Removing old container..."
docker rm backend || true

echo "Starting new container..."
docker run -d -p 5000:5000 --name backend my-backend

echo "Deployment complete!"
