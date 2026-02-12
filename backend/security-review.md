# Backend Security Review – February 2026

| # | Finding | Severity | Evidence |
|---|---------|----------|----------|
| 1 | First-time staff password enrolment can be hijacked | Critical | `routes/api/v1.php:36` exposes `POST /api/v1/staff/set-password` to the public, and `app/Http/Controllers/V1/StaffAuthController.php:123-156` only requires a `service_no` to set a password |
| 2 | Staff ID cards expose PII without authentication | High | `routes/api/v1.php:55` registers a public `GET /api/v1/staff/id-card/{serviceNo}` that returns full records from `app/Http/Controllers/V1/StaffController.php:209-239` |
| 3 | Education certificates/documents are world-readable | High | `routes/api/v1.php:58` exposes `GET /api/v1/staff-education/{staffEducation}/certificate` and the implementation at `app/Http/Controllers/V1/StaffEducationController.php:260-306` streams any stored certificate without auth |
| 4 | Any authenticated user can manage platform users | High | `routes/api/v1.php:131` mounts `Route::apiResource('users', UserController::class)` under the Sanctum group, but `app/Http/Controllers/V1/UserController.php:28-107` contains no `authorize()` checks and accepts `$request->all()` |
| 5 | Reference data write APIs lack authorization and validation | Medium | `routes/api/v1.php:154-156` exposes POST/PUT/DELETE for multiple enumerations, and `app/Http/Controllers/V1/GenericController.php:61-91` blindly performs `create/update/delete` with `$request->all()` and no policy checks |

## Finding Details & Recommended Mitigations

### 1. First-time staff password enrolment can be hijacked (Critical)
The `setPassword` action at `app/Http/Controllers/V1/StaffAuthController.php:123-156` accepts only a `service_no` plus a new password. No OTP, token, or personally-identifying challenge is required, yet the route is public (`routes/api/v1.php:36`). Attackers who enumerate service numbers can register passwords for any staff profile that has not yet set one, immediately receiving a bearer token and taking full control of that identity. Introduce a signed token flow (e.g., email/SMS link or administratively issued enrolment code) and rate-limit + audit the endpoint. At minimum, require verification of multiple immutable attributes (IPPIS + file number) and store a one-time enrollment token tied to the staff member.

### 2. Staff ID cards expose PII without authentication (High)
`StaffController::idCard` (`app/Http/Controllers/V1/StaffController.php:209-239`) is reachable anonymously through `GET /api/v1/staff/id-card/{serviceNo}` (`routes/api/v1.php:55`). It returns DOB, IPPIS, rank, state, and photo data for any service number, enabling enumeration and large-scale leakage of sensitive employee information. Require `auth:sanctum` (or at least signed URLs), restrict responses to the requesting staff member, and mask highly sensitive fields (IPPIS, DOB, etc.). Log and rate-limit the endpoint to detect probing.

### 3. Education certificates/documents are world-readable (High)
`GET /api/v1/staff-education/{staffEducation}/certificate` (`routes/api/v1.php:58`) is public, and `StaffEducationController::viewCertificate` (`app/Http/Controllers/V1/StaffEducationController.php:260-306`) simply reads the file from `storage/app/public` and returns it with cache-control headers set for a year. With predictable numeric IDs, any unauthenticated attacker can download staff certificates, degrees, or other uploaded documents, which likely contain PII. Protect the route with `auth:sanctum`, enforce ownership/permission checks (only the staff member and authorized reviewers should see it), and consider expiring signed URLs instead of static IDs.

### 4. Any authenticated user can manage platform users (High)
`Route::apiResource('users', UserController::class)` is mounted inside the authenticated group (`routes/api/v1.php:131`), but every CRUD handler in `UserController` (`app/Http/Controllers/V1/UserController.php:28-107`) omits `authorize()`/policy checks except for role-assignment helpers. As soon as a staff member obtains any token (even one scoped only for self-service), they can list administrators, create new user accounts, reset other users’ passwords (because updates accept payloads with hashed passwords), or delete accounts entirely. Wrap the controller in granular policies (`user.view`, `user.create`, etc.), validate inputs strictly (`$request->validate()` instead of `$request->all()` in `store`), and ensure only privileged roles receive those permissions.

### 5. Reference data write APIs lack authorization and validation (Medium)
The dynamic resource routes (`routes/api/v1.php:154-156`) allow POST/PUT/DELETE against `/api/v1/{model}` for zones, states, prisons, levels, rankings, etc. The controller (`app/Http/Controllers/V1/GenericController.php:61-91`) performs `create`, `update`, and `delete` directly with `$request->all()` and no `authorize()` call, so any authenticated account can tamper with critical lookup data or inject unexpected columns (mass assignment bypass). Apply explicit policies (e.g., `lookup.manage`) before mutating, whitelist/validate attributes per model, and prefer dedicated controllers for each resource so validation rules are auditable.

## Additional Observations
- The default `.env` checked into the workspace still has `APP_DEBUG=true` and a real `APP_KEY`. Ensure production deployments override these values and keep `.env` files out of source control to avoid leaking secrets.
- Public complaint submission relies solely on service number + IPPIS (`app/Http/Controllers/V1/ComplaintController.php:187-238`). Consider adding CAPTCHA or rate limits beyond `throttle:auth` to reduce automated enumeration attempts.

Addressing the high-severity issues above should be prioritized before onboarding more users to the platform.
