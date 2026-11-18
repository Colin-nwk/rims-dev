@echo off
setlocal
echo ==============================================================
echo  RIMS - Automated Office LAN Intranet Deployment Setup
echo ==============================================================
echo.

:: Check for Administrator permissions
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Running without Administrator privileges.
    echo Some steps like Firewall or Hosts file update may require elevation.
    echo If needed, please right-click this file and select "Run as administrator".
    echo.
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-production.ps1"

echo.
pause
