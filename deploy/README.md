# RIMS Office LAN Intranet Deployment System

This directory contains the complete set of deployment configurations, automation scripts, SSL certificates, and client onboarding packages for running **RIMS** on an isolated local area network (LAN / intranet) under the custom domain **`https://rims.ng`**.

---

## Directory Overview

```text
C:\xampp\htdocs\rims\deploy\
├── apache\
│   └── httpd-vhosts-rims.conf      # Apache VirtualHost configuration for RIMS
├── client\
│   ├── install-ca-client.bat       # 1-click root CA installer for staff PCs
│   ├── office-ca.crt               # Public Root CA certificate for clients
│   └── README.md                   # Router and client setup instructions
├── scripts\
│   ├── build-frontend.bat          # Builds React SPA with production config
│   ├── generate-certificates.ps1   # Generates Office Root CA and rims.ng SSL certs
│   ├── update-server-hosts.ps1     # Updates server Windows hosts file
│   ├── setup-production.bat        # Master 1-click deployment runner (Batch)
│   ├── setup-production.ps1        # Master deployment runner (PowerShell)
│   ├── update-production.bat       # Fast update script for day-to-day pulls/migrations
│   └── backup-rims.bat             # Offline database and document backup script
└── ssl\
    ├── office-ca.key               # Office Root CA Private Key (KEEP SECURE)
    ├── office-ca.crt               # Office Root CA Certificate
    ├── rims.key                    # rims.ng Private Key
    ├── rims.csr                    # Certificate Signing Request
    ├── rims.ext                    # OpenSSL SAN extension configuration
    └── rims.crt                    # Signed rims.ng Certificate (valid 825 days)
```

---

## Quick Start: Deploying to the Server

1. Open File Explorer to:
   ```
   C:\xampp\htdocs\rims\deploy\scripts
   ```
2. Right-click **`setup-production.bat`** and select **"Run as administrator"**.
3. In the XAMPP Control Panel, ensure **Apache** and **MySQL** are running.
4. On the server, open:
   ```
   https://rims.ng
   ```
   and test `https://rims.ng/up` (returns 200 OK).

---

## Architecture Summary

- **Single Domain:** `https://rims.ng` handles both the React SPA and Laravel API.
- **Reverse Proxy:** Apache serves the React build from `frontend-new/dist` and proxies `/api/`, `/storage/`, and `/up` to the internal Laravel backend listening on `127.0.0.1:8081`.
- **Zero CORS / Same Origin:** Because both frontend and backend share `https://rims.ng`, staff photo rendering, file previews, and QR codes operate without cross-origin friction.
- **Router DNS:** The office router maps `rims.ng` to the server's LAN IP, eliminating the need to edit `hosts` files on client PCs.
