@echo off
setlocal
echo ==============================================================
echo  Nigerian Correctional Service (NCoS)
echo  Install Office Intranet Root CA Certificate
echo ==============================================================
echo.

:: Check for Administrator permissions
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges.
    echo Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

set "CERT_FILE=%~dp0office-ca.crt"

if not exist "%CERT_FILE%" (
    echo [ERROR] Certificate file not found: %CERT_FILE%
    echo Please make sure office-ca.crt is in the same folder as this script.
    echo.
    pause
    exit /b 1
)

echo Installing NCoS Office Intranet CA into Windows Trusted Root store...
certutil -addstore -f "Root" "%CERT_FILE%"
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Certificate installed successfully!
    echo Your browser will now securely trust https://rims.ng without warnings.
    echo (Note: If using Firefox, enable "security.enterprise_roots.enabled" in about:config
    echo  or import office-ca.crt directly into Firefox Certificates).
) else (
    echo.
    echo [ERROR] Failed to install certificate. Error code: %errorlevel%
)

echo.
pause
