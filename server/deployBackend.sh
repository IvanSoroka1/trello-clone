#!/bin/bash
set -e

echo "Building Docker image..."
docker build -t my-backend .

echo "Stopping old container..."
docker stop backend

echo "Removing old container..."
docker rm backend

echo "Starting new container..."
docker run -d -p 5000:5000 --name backend my-backend

echo "Deployment complete!"

