#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

echo "Clearing configuration cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Setting storage permissions..."
chmod -R 775 storage bootstrap/cache

echo "Build completed successfully!"
