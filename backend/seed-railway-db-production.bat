@echo off
REM Production Database Seeder Script for Windows
REM This script connects to your Railway production database and runs seeders

echo ==========================================
echo Production Database Seeder
echo ==========================================
echo.
echo WARNING: This will seed your production database!
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo Seeding cancelled.
    exit /b 0
)

echo.
echo Loading production environment...

REM Load environment from .env.production
for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
)

echo Environment loaded
echo.
echo Database Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_DATABASE%
echo   Username: %DB_USERNAME%
echo.

echo Running seeders...
php artisan db:seed --force

if %errorlevel% equ 0 (
    echo.
    echo Seeding completed successfully!
) else (
    echo.
    echo Seeding failed. Check the error messages above.
    exit /b 1
)
