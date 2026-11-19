@echo off
REM ============================================
REM Seed Staff Data - LOCAL Database
REM ============================================
REM Seeds staff data from rims_2.sql into LOCAL database
REM Uses .env file for database credentials
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo    Seed Staff Data - LOCAL Database
echo ==========================================
echo.

REM Check prerequisites
if not exist "artisan" (
    echo [ERROR] artisan not found. Make sure you're in the backend directory.
    exit /b 1
)

if not exist "rims_2.sql" (
    echo [ERROR] rims_2.sql not found.
    exit /b 1
)

if not exist "database\seeders\SqlStaffSeeder.php" (
    echo [ERROR] SqlStaffSeeder.php not found.
    exit /b 1
)

echo [INFO] Target: LOCAL database ^(.env^)
echo.
echo [WARNING] This will TRUNCATE all existing data in:
echo    - staff_education
echo    - staff_details  
echo    - staff
echo.

set /p confirm="Are you sure you want to continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo [CANCELLED] Seeding cancelled.
    exit /b 0
)

echo.
echo [INFO] Running seeder...
echo.

php artisan db:seed --class=SqlStaffSeeder

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Local database seeded successfully!
) else (
    echo.
    echo [ERROR] Seeding failed. Check the error messages above.
    exit /b 1
)

endlocal
exit /b 0
