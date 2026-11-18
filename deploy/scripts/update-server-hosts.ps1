# Script to update Windows hosts file on the server for rims.ng
$hostsPath = "$env:windir\System32\drivers\etc\hosts"

if (-not (Test-Path $hostsPath)) {
    Write-Error "Hosts file not found at $hostsPath"
    exit 1
}

# Create backup in deploy directory to avoid System32 new file permissions
$backupPath = "C:\xampp\htdocs\rims\deploy\ssl\hosts.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path $hostsPath -Destination $backupPath -Force
Write-Host "Backed up hosts file to: $backupPath" -ForegroundColor Cyan

$content = Get-Content -Path $hostsPath -Raw

$entriesToAdd = @(
    "127.0.0.1`trims.ng",
    "127.0.0.1`twww.rims.ng"
)

$modified = $false
foreach ($entry in $entriesToAdd) {
    $domain = ($entry -split '\s+')[1]
    if ($content -notmatch "(?m)^\s*127\.0\.0\.1\s+$([regex]::Escape($domain))\b") {
        Add-Content -Path $hostsPath -Value "`r`n$entry"
        Write-Host "Added to hosts: $entry" -ForegroundColor Green
        $modified = $true
    } else {
        Write-Host "Already present in hosts: $domain" -ForegroundColor Yellow
    }
}

# Flush DNS cache
& ipconfig /flushdns | Out-Null
Write-Host "Flushed local DNS cache." -ForegroundColor Green
