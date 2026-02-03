#!/bin/bash

# Production Database Seeder Script
# This script connects to your Railway production database and runs seeders
# Usage: ./seed-production.sh

echo "=========================================="
echo "Production Database Seeder"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will seed your production database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Seeding cancelled."
    exit 0
fi

echo ""
echo "Loading production environment..."

# Load .env.production file
export $(grep -v '^#' .env.production | xargs)

echo "✓ Environment loaded"
echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  Username: $DB_USERNAME"
echo ""

echo "Running seeders..."
php artisan migrate:fresh db:seed --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seeding completed successfully!"
else
    echo ""
    echo "❌ Seeding failed. Check the error messages above."
    exit 1
fi
