# PowerShell script to generate Office Root CA and SSL Certificate for rims.ng
$ErrorActionPreference = "Stop"

$OpenSslExe = "C:\xampp\apache\bin\openssl.exe"
$OpenSslCnf = "C:\xampp\apache\conf\openssl.cnf"
$env:OPENSSL_CONF = $OpenSslCnf

$DeployDir = "C:\xampp\htdocs\rims\deploy"
$SslDir = "$DeployDir\ssl"
$ClientDir = "$DeployDir\client"
$ApacheCrtDir = "C:\xampp\apache\conf\ssl.crt"
$ApacheKeyDir = "C:\xampp\apache\conf\ssl.key"

Write-Host "=== 1. Generating Office Root CA ===" -ForegroundColor Cyan
$CaKey = "$SslDir\office-ca.key"
$CaCrt = "$SslDir\office-ca.crt"

if (-not (Test-Path $CaKey)) {
    & $OpenSslExe req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes `
        -keyout $CaKey -out $CaCrt `
        -subj "/C=NG/ST=FCT/L=ABUJA/O=Nigerian Correctional Service/OU=ICT/CN=NCoS Office Intranet CA"
    Write-Host "Generated new Office Root CA: $CaCrt" -ForegroundColor Green
} else {
    Write-Host "Using existing Office Root CA: $CaCrt" -ForegroundColor Yellow
}

Write-Host "=== 2. Generating rims.ng Private Key and CSR ===" -ForegroundColor Cyan
$RimsKey = "$SslDir\rims.key"
$RimsCsr = "$SslDir\rims.csr"
$RimsExt = "$SslDir\rims.ext"
$RimsCrt = "$SslDir\rims.crt"

& $OpenSslExe req -newkey rsa:2048 -nodes `
    -keyout $RimsKey -out $RimsCsr `
    -subj "/C=NG/ST=FCT/L=ABUJA/O=Nigerian Correctional Service/OU=ICT/CN=rims.ng"

@"
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = rims.ng
DNS.2 = www.rims.ng
DNS.3 = localhost
IP.1 = 127.0.0.1
"@ | Set-Content -Path $RimsExt -Encoding ASCII

Write-Host "=== 3. Signing rims.ng Certificate with Office CA ===" -ForegroundColor Cyan
& $OpenSslExe x509 -req -in $RimsCsr -CA $CaCrt -CAkey $CaKey `
    -CAcreateserial -out $RimsCrt -days 825 -sha256 -extfile $RimsExt

Write-Host "=== 4. Deploying Certificates to Apache and Client folder ===" -ForegroundColor Cyan
Copy-Item -Force $RimsCrt "$ApacheCrtDir\rims.crt"
Copy-Item -Force $RimsKey "$ApacheKeyDir\rims.key"
Copy-Item -Force $CaCrt "$ApacheCrtDir\office-ca.crt"
Copy-Item -Force $CaCrt "$ClientDir\office-ca.crt"

Write-Host "=== Certificate Verification ===" -ForegroundColor Cyan
& $OpenSslExe x509 -in "$ApacheCrtDir\rims.crt" -noout -subject -issuer -dates -ext subjectAltName

Write-Host "`nAll SSL certificates generated and installed successfully!" -ForegroundColor Green
