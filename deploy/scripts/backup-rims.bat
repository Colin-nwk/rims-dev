@echo off
setlocal enabledelayedexpansion
echo ==============================================================
echo  RIMS - Automated Offline Backup (Database + Uploaded Documents)
echo ==============================================================
echo.

set "BACKUP_ROOT=C:\xampp\htdocs\rims\backups"
set "MYSQLDUMP=C:\xampp\mysql\bin\mysqldump.exe"
set "STORAGE_DIR=C:\xampp\htdocs\rims\backend\storage\app\public"

:: Create timestamp YYYYMMDD_HHMMSS
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"
set "CURRENT_BACKUP=%BACKUP_ROOT%\backup_%TIMESTAMP%"

if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
mkdir "%CURRENT_BACKUP%"

echo [1/2] Backing up MariaDB database 'rims'...
"%MYSQLDUMP%" -u root --routines --triggers --single-transaction rims > "%CURRENT_BACKUP%\rims_database.sql"
if %errorlevel% equ 0 (
    echo     Database dumped successfully to rims_database.sql
) else (
    echo     [WARNING] Database backup returned code %errorlevel%. Is MySQL running?
)

echo [2/2] Backing up uploaded files (photos, certificates)...
if exist "%STORAGE_DIR%" (
    xcopy /E /I /Q /Y "%STORAGE_DIR%" "%CURRENT_BACKUP%\storage_public\" >nul
    echo     Storage files backed up to storage_public\
) else (
    echo     [INFO] Storage folder does not exist yet.
)

echo.
echo ==============================================================
echo [SUCCESS] Backup completed! Location:
echo %CURRENT_BACKUP%
echo ==============================================================
echo.
pause
