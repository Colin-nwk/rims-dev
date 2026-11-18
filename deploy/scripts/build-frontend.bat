@echo off
setlocal
echo ==============================================================
echo  RIMS - Build Production Frontend for LAN Intranet
echo ==============================================================
echo.

cd /d C:\xampp\htdocs\rims\frontend-new

if not exist ".env.production" (
    echo Creating .env.production with VITE_API_URL=/api/v1...
    echo VITE_API_URL=/api/v1> .env.production
)

echo Building React SPA into dist/...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================
    echo [SUCCESS] Frontend built successfully! Output is in frontend-new/dist
    echo ==============================================================
) else (
    echo.
    echo [ERROR] Frontend build failed with error code %errorlevel%.
)

echo.
pause
