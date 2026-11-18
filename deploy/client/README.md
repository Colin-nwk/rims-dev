# RIMS Client Onboarding & Office Router Configuration Guide

This folder contains the files needed to connect office computers on the local network (LAN / Switch / Wi-Fi) to **RIMS** (`https://rims.ng`).

---

## 1. Office Router Setup (Done ONCE by Network Administrator)

Because RIMS is designed to run locally on the intranet without depending on the internet:

1. Log into your office router's admin panel (e.g. `192.168.1.1` or `10.0.0.1`).
2. Navigate to **DHCP / DNS / Static DNS / Local DNS / Host Entries** (the same section where `cims.ng` was configured).
3. Add a new static DNS record:
   - **Hostname:** `rims.ng`
   - **IP Address:** `<SERVER_LAN_IP>` (e.g. the static IP of this XAMPP server)
   - *(Optional)* **Hostname:** `www.rims.ng` -> `<SERVER_LAN_IP>`
4. **Ensure DHCP distributes this router as the primary DNS server** to all connected office PCs.
5. If the router has **DNS Rebinding Protection**, add `rims.ng` (and `cims.ng`) to the allowed domain whitelist.

---

## 2. Client Computer Setup (Takes 30 Seconds per PC)

Client PCs do **NOT** need their `hosts` file edited because the router resolves `rims.ng` automatically for everyone.

To enable SSL security (green lock / padlock) without certificate warnings:

1. Copy this `client` folder (or just `office-ca.crt` and `install-ca-client.bat`) to a USB drive or shared LAN folder.
2. On any office Windows PC, **Right-click `install-ca-client.bat`** and choose **"Run as administrator"**.
3. When prompted, confirm. The script installs the **NCoS Office Intranet Root CA** into the Windows Trusted Root Certification Authorities store.
4. Open the web browser (Chrome, Edge, Brave) and visit:
   ```
   https://rims.ng
   ```
5. You should see the secure padlock icon and the RIMS portal immediately!

### Note for Mozilla Firefox Users:
Firefox uses its own certificate store by default. To make Firefox trust Windows certificates:
- In Firefox, open a new tab and type `about:config`.
- Search for `security.enterprise_roots.enabled`.
- Toggle the value to `true`.
*(Alternatively, go to Settings -> Privacy & Security -> Certificates -> View Certificates -> Authorities -> Import, and select `office-ca.crt`).*

---

## 3. Testing & Troubleshooting

### Test 1: DNS Resolution
Open Command Prompt (`cmd`) on the client PC:
```cmd
nslookup rims.ng
```
- It should return the `<SERVER_LAN_IP>`.
- If it fails, flush the DNS cache:
  ```cmd
  ipconfig /flushdns
  ```

### Test 2: Network Connectivity
```cmd
ping rims.ng
```
- You should receive replies from `<SERVER_LAN_IP>`.
