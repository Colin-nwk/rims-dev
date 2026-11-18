@echo off
setlocal
echo ==============================================================
echo  RIMS - Quick Production Update (Pulls / Migrates / Builds)
echo ==============================================================
echo.

set "RIMS_ROOT=C:\xampp\htdocs\rims"
set "PHP=C:\xampp\php\php.exe"

cd /d "%RIMS_ROOT%"

echo [1/4] Running database migrations...
"%PHP%" "%RIMS_ROOT%\backend\artisan" migrate --force

echo [2/4] Optimizing Laravel configuration cache...
"%PHP%" "%RIMS_ROOT%\backend\artisan" optimize:clear
"%PHP%" "%RIMS_ROOT%\backend\artisan" optimize

echo [3/4] Rebuilding frontend SPA...
cd /d "%RIMS_ROOT%\frontend-new"
call npm run build

echo [4/4] Verifying Apache syntax...
C:\xampp\apache\bin\httpd.exe -t

echo.
echo ==============================================================
echo [SUCCESS] RIMS updated successfully!
echo ==============================================================
echo.
pause
