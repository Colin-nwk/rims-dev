# Deploying the backend on Wasmer Edge

The repo is a monorepo (`backend/` = Laravel 12, `frontend-new/` = Vite/React). Deploy only `backend/`.

## Build settings

| Setting | Value |
|---|---|
| Root / app directory | `backend` (important: the repo root has no `composer.json`) |
| Install Command | `composer install --no-dev --optimize-autoloader --ignore-platform-reqs --no-scripts --no-interaction` |
| Build Command | leave empty (do NOT run `migrate` here; the DB is usually not reachable at build time) |
| Start Command | leave empty (Wasmer's PHP runtime serves `public/index.php`) |

Do not use `docker/start.sh` or `build.sh`; they are for the Render/Docker setup (they start nginx, php-fpm and a queue worker).

## Database (Enable Database -> MySQL)

Wasmer injects `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PORT`, `DB_PASSWORD`.
Laravel reads `DB_DATABASE`, not `DB_NAME`, so rename the key in the form:

| Key | Value |
|---|---|
| DB_HOST | `${DB_HOST}` |
| DB_DATABASE | `${DB_NAME}` |
| DB_USERNAME | `${DB_USERNAME}` |
| DB_PORT | `${DB_PORT}` |
| DB_PASSWORD | `${DB_PASSWORD}` |

## Other environment variables

```
APP_NAME=RIMS
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...          # run: php artisan key:generate --show
APP_URL=https://<your-app>.wasmer.app
FRONTEND_URL=https://<your-frontend-url>
DB_CONNECTION=mysql
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync       # no persistent queue worker on Wasmer
LOG_CHANNEL=stderr
FILESYSTEM_DISK=local
MAIL_MAILER=log             # or real SMTP / RESEND_API_KEY
```

Frontend: set `VITE_API_URL=https://<your-app>.wasmer.app/api/v1` at its build time.

## After the first deploy

Run once against the Wasmer database (locally with the DB credentials, or via a Wasmer job/shell if available):

```
php artisan migrate --force
php artisan db:seed --force
```

## Caveats

- Filesystem is ephemeral: uploaded files / staff photos in `storage/` and `pictures/` will not persist. Use S3 (`AWS_*`, `FILESYSTEM_DISK=s3`) for uploads.
- `maatwebsite/excel` needs PHP `gd` and `zip`; `--ignore-platform-reqs` only skips Composer's check, so test an export after deploying.
- `config/cors.php` allows all origins; restrict to the frontend URL for production.
