#!/bin/bash

# Start PHP-FPM in the background
php-fpm -D

# Run Laravel optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Start Nginx in the foreground
nginx -g "daemon off;"
