#!/bin/bash
set -e

echo "🚀 ReadySetHire Backend Starting..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    until npx prisma db push --accept-data-loss --force-reset 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null; do
        echo "Database not ready, waiting 3 seconds..."
        sleep 3
    done
    echo "✅ Database is ready!"
}

# Function to run migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Try to run migrations, if they fail, try to push schema
    if ! npx prisma migrate deploy; then
        echo "⚠️ Migration deploy failed, trying db push..."
        npx prisma db push --accept-data-loss
    fi
    
    echo "✅ Database schema is up to date!"
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database..."
    if [ -f "dist/db/seed.js" ]; then
        node dist/db/seed.js || echo "⚠️ Seeding failed or no seed data"
    else
        echo "ℹ️ No seed file found, skipping..."
    fi
}

# Main execution
echo "🔧 Starting database setup..."
wait_for_db
run_migrations

# Generate Prisma client (ensure it's fresh)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Optional seeding
seed_database

echo "🎉 Database setup complete!"
echo "🚀 Starting application..."

# Start the application
exec npm start