# Master Setup Script for RIMS LAN Intranet Deployment (https://rims.ng)
# Run as Administrator in PowerShell

$ErrorActionPreference = "Stop"

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  RIMS - Automated Office LAN Intranet Deployment Setup       " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "[WARNING] Script is not running as Administrator." -ForegroundColor Yellow
    Write-Host "Hosts file and Firewall updates require Administrator privileges." -ForegroundColor Yellow
    Write-Host "If any step fails, please right-click PowerShell and choose 'Run as Administrator'." -ForegroundColor Yellow
    Write-Host ""
}

$RimsRoot = "C:\xampp\htdocs\rims"
$BackendDir = "$RimsRoot\backend"
$FrontendDir = "$RimsRoot\frontend-new"
$DeployDir = "$RimsRoot\deploy"
$PhpExe = "C:\xampp\php\php.exe"
$HttpdExe = "C:\xampp\apache\bin\httpd.exe"

# 1. SSL Certificates
Write-Host "[1/7] Checking SSL Certificates..." -ForegroundColor Cyan
$RimsCrt = "C:\xampp\apache\conf\ssl.crt\rims.crt"
$RimsKey = "C:\xampp\apache\conf\ssl.key\rims.key"
if (-not (Test-Path $RimsCrt) -or -not (Test-Path $RimsKey)) {
    Write-Host "Generating SSL certificates for rims.ng..." -ForegroundColor Yellow
    & powershell -NoProfile -ExecutionPolicy Bypass -File "$DeployDir\scripts\generate-certificates.ps1"
} else {
    Write-Host "SSL certificates are installed in Apache." -ForegroundColor Green
}

# 2. Server Hosts File
Write-Host "`n[2/7] Checking Server Hosts file..." -ForegroundColor Cyan
& powershell -NoProfile -ExecutionPolicy Bypass -File "$DeployDir\scripts\update-server-hosts.ps1"

# 3. Backend Storage Link
Write-Host "`n[3/7] Checking Storage Junction..." -ForegroundColor Cyan
$StorageLink = "$BackendDir\public\storage"
$StorageTarget = "$BackendDir\storage\app\public"
if (-not (Test-Path $StorageLink)) {
    Write-Host "Creating NTFS junction for storage..." -ForegroundColor Yellow
    cmd /c mklink /J "$StorageLink" "$StorageTarget"
} else {
    Write-Host "Storage junction already exists." -ForegroundColor Green
}

# 4. Backend Environment & Cache
Write-Host "`n[4/7] Configuring Backend Environment..." -ForegroundColor Cyan
$EnvFile = "$BackendDir\.env"
$EnvProdFile = "$BackendDir\.env.production"
if (Test-Path $EnvProdFile) {
    if (Test-Path $EnvFile) {
        $EnvBackup = "$BackendDir\.env.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item -Path $EnvFile -Destination $EnvBackup -Force
        Write-Host "Backed up existing .env to $EnvBackup" -ForegroundColor DarkGray
    }
    Copy-Item -Path $EnvProdFile -Destination $EnvFile -Force
    Write-Host "Applied production .env configuration (APP_URL=https://rims.ng)." -ForegroundColor Green
}

Write-Host "Optimizing Laravel configuration & routes..." -ForegroundColor Cyan
& $PhpExe "$BackendDir\artisan" optimize:clear
& $PhpExe "$BackendDir\artisan" optimize

# 5. Build Frontend
Write-Host "`n[5/7] Building Frontend SPA..." -ForegroundColor Cyan
Set-Location $FrontendDir
$env:VITE_API_URL = "/api/v1"
npm run build
Set-Location $RimsRoot
Write-Host "Frontend build completed in $FrontendDir\dist" -ForegroundColor Green

# 6. Apache Configuration Test
Write-Host "`n[6/7] Testing Apache Configuration..." -ForegroundColor Cyan
$oldEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$syntaxTest = & $HttpdExe -t 2>&1 | Out-String
$ErrorActionPreference = $oldEap
Write-Host $syntaxTest.Trim() -ForegroundColor Green
if ($syntaxTest -notmatch "Syntax OK") {
    Write-Error "Apache configuration test failed! Please check httpd-vhosts-rims.conf"
}

# 7. Windows Firewall
Write-Host "`n[7/7] Checking Windows Firewall for LAN ports 80 & 443..." -ForegroundColor Cyan
try {
    $existingRule = Get-NetFirewallRule -DisplayName "Intranet Apache HTTP/HTTPS" -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName "Intranet Apache HTTP/HTTPS" -Direction Inbound `
            -Protocol TCP -LocalPort 80,443 -Action Allow -Profile Private,Domain | Out-Null
        Write-Host "Created Inbound Firewall rule for ports 80 and 443." -ForegroundColor Green
    } else {
        Write-Host "Firewall rule 'Intranet Apache HTTP/HTTPS' already exists." -ForegroundColor Green
    }
} catch {
    Write-Host "Could not query/set firewall (requires Administrator). Skipping..." -ForegroundColor Yellow
}

Write-Host "`n==============================================================" -ForegroundColor Green
Write-Host "  RIMS LAN Intranet Setup Complete!                           " -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "URL: https://rims.ng"
Write-Host "Client CA Certificate: $DeployDir\client\office-ca.crt"
Write-Host "Client Installer: $DeployDir\client\install-ca-client.bat"
Write-Host ""
