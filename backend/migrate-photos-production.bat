@echo off
REM ============================================
REM Migrate Staff Photos - PRODUCTION (Cloudflare R2)
REM ============================================
REM Uploads photos from .\pictures to the R2 bucket and updates the
REM `photo` column of staff records in the PRODUCTION database.
REM Uses .env.production for database and R2 credentials.
REM
REM Usage:
REM   migrate-photos-production.bat              ^(run migration^)
REM   migrate-photos-production.bat --dry-run    ^(preview only^)
REM   migrate-photos-production.bat --limit=50   ^(extra args are passed through^)
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo    Migrate Staff Photos - PRODUCTION
echo ==========================================
echo.

REM Check prerequisites
if not exist "artisan" (
    echo [ERROR] artisan not found. Make sure you're in the backend directory.
    exit /b 1
)

if not exist "pictures\" (
    echo [ERROR] pictures\ directory not found.
    exit /b 1
)

if not exist ".env.production" (
    echo [ERROR] .env.production not found.
    exit /b 1
)

REM Load values from .env.production
set "DB_HOST="
set "DB_PORT="
set "DB_DATABASE="
set "R2_ACCESS_KEY_ID="
set "R2_SECRET_ACCESS_KEY="
set "R2_BUCKET="
set "R2_ENDPOINT="
for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
    if "%%a"=="DB_HOST" set "DB_HOST=%%b"
    if "%%a"=="DB_PORT" set "DB_PORT=%%b"
    if "%%a"=="DB_DATABASE" set "DB_DATABASE=%%b"
    if "%%a"=="R2_ACCESS_KEY_ID" set "R2_ACCESS_KEY_ID=%%b"
    if "%%a"=="R2_SECRET_ACCESS_KEY" set "R2_SECRET_ACCESS_KEY=%%b"
    if "%%a"=="R2_BUCKET" set "R2_BUCKET=%%b"
    if "%%a"=="R2_ENDPOINT" set "R2_ENDPOINT=%%b"
)

for %%v in (DB_HOST DB_DATABASE R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_ENDPOINT) do (
    if "!%%v!"=="" (
        echo [ERROR] %%v is not set in .env.production.
        exit /b 1
    )
)

set PHOTO_COUNT=0
for %%f in (pictures\*.jpg) do set /a PHOTO_COUNT+=1

echo [INFO] Target: PRODUCTION ^(.env.production^)
echo.
echo    DB Host:   %DB_HOST%
echo    DB Port:   %DB_PORT%
echo    Database:  %DB_DATABASE%
echo    R2 Bucket: %R2_BUCKET%
echo    Photos:    %PHOTO_COUNT% files in pictures\
echo.

set DRY_RUN=0
for %%a in (%*) do (
    if /i "%%a"=="--dry-run" set DRY_RUN=1
)

if "%DRY_RUN%"=="0" (
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo !!  WARNING: THIS IS THE PRODUCTION DB!  !!
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo.
    echo This will upload photos to R2 and update staff.photo in the database.
    echo.

    set /p confirm="Type 'MIGRATE PHOTOS' to confirm: "
    if /i not "!confirm!"=="MIGRATE PHOTOS" (
        echo [CANCELLED] Photo migration cancelled.
        exit /b 0
    )
)

echo.
echo [INFO] Clearing config cache...
php artisan config:clear

echo.
echo [INFO] Migrating photos to R2...
echo.

set APP_ENV=production
php artisan staff:migrate-photos --env=production --disk=r2 --force %*

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Photo migration finished.
) else (
    echo.
    echo [ERROR] Photo migration failed. Check the error messages above.
    exit /b 1
)

endlocal
exit /b 0
