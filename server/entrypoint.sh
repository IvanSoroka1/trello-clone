#!/bin/bash
set -e

echo "🚀 Running database migrations..."
dotnet ef database update --no-build --project /app

echo "✅ Starting backend..."
exec dotnet server.dll

