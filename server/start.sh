#!/bin/bash
echo "🚀 Starting ReadySetHire..."

# Start database
echo "📦 Starting database..."
docker compose up postgres -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy

# Start application
echo "🎯 Starting application..."
npm run dev
