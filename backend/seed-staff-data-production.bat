@echo off
REM ============================================
REM Seed Staff Data - PRODUCTION Database
REM ============================================
REM Seeds staff data from rims-staff.sql into PRODUCTION database
REM Uses .env.production file for database credentials
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo    Seed Staff Data - PRODUCTION Database
echo ==========================================
echo.

REM Check prerequisites
if not exist "artisan" (
    echo [ERROR] artisan not found. Make sure you're in the backend directory.
    exit /b 1
)

if not exist "rims-staff.sql" (
    echo [ERROR] rims-staff.sql not found.
    exit /b 1
)

if not exist ".env.production" (
    echo [ERROR] .env.production not found.
    exit /b 1
)

if not exist "database\seeders\SqlStaffSeeder.php" (
    echo [ERROR] SqlStaffSeeder.php not found.
    exit /b 1
)

REM Load and display production DB info
for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
    set "line=%%a"
    if "%%a"=="DB_HOST" set "PROD_HOST=%%b"
    if "%%a"=="DB_PORT" set "PROD_PORT=%%b"
    if "%%a"=="DB_DATABASE" set "PROD_DB=%%b"
)

echo [INFO] Target: PRODUCTION database ^(.env.production^)
echo.
echo    Host:     %PROD_HOST%
echo    Port:     %PROD_PORT%
echo    Database: %PROD_DB%
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo !!  WARNING: THIS IS THE PRODUCTION DB!  !!
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.
echo This will TRUNCATE all existing data in:
echo    - staff_education
echo    - staff_details
echo    - staff
echo.

set /p confirm="Type 'SEED PRODUCTION' to confirm: "
if /i not "%confirm%"=="SEED PRODUCTION" (
    echo [CANCELLED] Seeding cancelled.
    exit /b 0
)

echo.
echo [INFO] Clearing config cache...
php artisan config:clear

echo.
echo [INFO] Running seeder on PRODUCTION...
echo.

set APP_ENV=production
php artisan db:seed --class=SqlStaffSeeder --env=production --force

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Production database seeded successfully!
) else (
    echo.
    echo [ERROR] Seeding failed. Check the error messages above.
    exit /b 1
)

endlocal
exit /b 0
