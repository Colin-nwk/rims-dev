#!/bin/bash
set -o errexit

# Start PHP-FPM in the background
php-fpm -D

echo "Clearing configuration cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Running database migrations..."
php artisan migrate:fresh --seed --force --no-interaction

echo "Clearing cache after migrations..."
php artisan cache:clear

echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Setting storage permissions..."
chmod -R 775 storage bootstrap/cache

echo "Starting Nginx..."
# Start Nginx in the foreground
nginx -g "daemon off;"
