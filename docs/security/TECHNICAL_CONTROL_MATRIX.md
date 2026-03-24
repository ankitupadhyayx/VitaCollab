# VitaCollab Technical Control Matrix

Audience: Engineering, Security, Compliance, Audit
Date: 2026-03-25

Legend:

- Status: Implemented, Partial, Config-Dependent
- Evidence: concrete implementation indicators in code/config

## Control Matrix

| Control ID | Domain | Control | Implementation File(s) | Evidence | Risk Mitigated | Status |
| --- | --- | --- | --- | --- | --- | --- |
| IAM-01 | Authentication | Short-lived access token + longer refresh token | backend/utils/authTokens.js, backend/utils/env.js | signAccessToken/signRefreshToken; default expiries 15m/7d | Long-lived session token abuse | Implemented |
| IAM-02 | Session Security | Refresh token in HttpOnly secure cookie | backend/utils/authCookies.js, backend/controllers/auth.controller.js | cookie set via getRefreshCookieOptions(); httpOnly/secure/sameSite none | XSS token theft from JS-accessible storage | Implemented |
| IAM-03 | Session Security | Refresh token hashing at rest | backend/models/user.model.js, backend/controllers/auth.controller.js, backend/utils/authTokens.js | refreshTokenHash stored and compared via sha256 hashToken() | DB leak exposing active refresh tokens | Implemented |
| IAM-04 | Session Security | Refresh token rotation on refresh | backend/controllers/auth.controller.js | refresh endpoint issues new refresh token and overwrites hash | Replay window reduction | Implemented |
| IAM-05 | Session Security | Mismatch detection and forced invalidation | backend/controllers/auth.controller.js | hash mismatch sets refreshTokenHash = null, returns unauthorized | Stolen/duplicated refresh token replay | Implemented |
| IAM-06 | Authorization | Route-level auth middleware | backend/middleware/auth.middleware.js | authenticate verifies bearer token and loads user state | Unauthorized API access | Implemented |
| IAM-07 | Authorization | Role-based and permission-based access controls | backend/middleware/role.middleware.js, backend/constants/admin-rbac.js | authorize(), requireRole(), requirePermission() checks | Privilege escalation / unauthorized admin actions | Implemented |
| IAM-08 | Account Governance | Blocked/suspended account enforcement | backend/middleware/auth.middleware.js, backend/controllers/auth.controller.js | blocked denied; suspended denied until expiry | Continued misuse by restricted accounts | Implemented |
| API-01 | Transport/API Hardening | Security headers | backend/app.js | helmet() enabled globally | Browser-based exploit classes (clickjacking, etc.) | Implemented |
| API-02 | Origin Control | CORS allowlist with credentials | backend/app.js, backend/utils/env.js | origin callback with allowlist; credentials true | Cross-origin misuse of authenticated APIs | Implemented |
| API-03 | Abuse Protection | Global API rate limiting | backend/middleware/rateLimit.middleware.js, backend/app.js | apiLimiter on /api | API flooding and brute-force pressure | Implemented |
| API-04 | Abuse Protection | Targeted auth endpoint rate limits | backend/middleware/rateLimit.middleware.js, backend/routes/auth.routes.js | login/forgot/reset/resend limiters applied | Credential stuffing and auth abuse | Implemented |
| API-05 | Abuse Protection | Share creation/access rate limits | backend/middleware/rateLimit.middleware.js, backend/routes/record.routes.js, backend/routes/share.routes.js | shareCreateLimiter/shareAccessLimiter | Share token brute-force and endpoint abuse | Implemented |
| API-06 | Input Validation | Schema validation on route boundaries | backend/middleware/validate.middleware.js, backend/utils/validators/*.js | validate(schema) with structured errors | Malformed payload and type-confusion paths | Implemented |
| API-07 | Input Sanitization | NoSQL operator sanitization and HPP mitigation | backend/app.js | express-mongo-sanitize + hpp middleware | NoSQL injection and query pollution | Implemented |
| API-08 | Payload Limits | Request body size limit | backend/app.js | express.json({ limit: '2mb' }) | Resource exhaustion via oversized JSON | Implemented |
| DATA-01 | Credential Protection | Password hashing | backend/utils/password.js, backend/models/user.model.js | bcrypt hash/compare; password select false | Password disclosure on DB compromise | Implemented |
| DATA-02 | Token Protection | Verification/reset/share token hashing | backend/controllers/auth.controller.js, backend/controllers/record.controller.js, backend/models/recordShareToken.model.js | createTokenWithHash + hashToken persisted | Raw token reuse after DB leak | Implemented |
| DATA-03 | Sensitive Field Protection | Secret fields excluded by default | backend/models/user.model.js | password/token hash fields with select: false | Accidental secret exposure in queries/responses | Implemented |
| DATA-04 | Confidential Data Encryption | AES-256-GCM encryption for rejection reasons | backend/utils/encryption.js, backend/controllers/record.controller.js, backend/models/record.model.js | encryptText/decryptText on encryptedRejectionReason | Sensitive note disclosure in storage | Implemented |
| FILE-01 | Upload Security | Extension + MIME allowlist | backend/middleware/upload.js | allowedExtensions/allowedMimeTypes checks | Dangerous file type uploads | Implemented |
| FILE-02 | Upload Security | Magic-byte content verification | backend/utils/fileSecurity.js, backend/middleware/upload.js | detectFileTypeFromSignature() enforced | Spoofed content-type/file extension | Implemented |
| FILE-03 | Upload Security | Executable signature and extension blocking | backend/utils/fileSecurity.js, backend/middleware/upload.js | hasExecutableSignature + blockedExecutableExtensions | Malware/script upload vectors | Implemented |
| FILE-04 | Upload Security | Upload size limits | backend/middleware/upload.js, backend/utils/env.js | multer limits from RECORD_UPLOAD_MAX_MB | DoS/storage abuse by large files | Implemented |
| FILE-05 | Malware Detection | Scanner integration with fail-closed real mode | backend/services/fileScanner.service.js, backend/middleware/upload.js | scanFile() returns clean false on scanner error in real mode | Infected upload acceptance during scanner outage | Implemented |
| FILE-06 | File Access Privacy | Authenticated access endpoint before URL issuance | backend/routes/files.routes.js, backend/controllers/file.controller.js | router uses authenticate; controller checks canAccessRecord() | Direct/public file exposure | Implemented |
| FILE-07 | File Access Privacy | Short-lived signed Cloudinary URLs | backend/controllers/file.controller.js, backend/utils/cloudinary.js | createSignedCloudinaryUrl() with expiresAt | Long-lived leaked file links | Implemented |
| FILE-08 | File Access Governance | Audit on file view/download | backend/controllers/file.controller.js, backend/services/audit.service.js | action file_view/file_download with resource metadata | Untraceable PHI access events | Implemented |
| SHARE-01 | Share Token Security | Random token + hash-only storage | backend/controllers/record.controller.js, backend/models/recordShareToken.model.js | createTokenWithHash; DB stores tokenHash | Share token replay from DB exposure | Implemented |
| SHARE-02 | Share Policy | Enforced short expiry window (15-30 min) | backend/controllers/record.controller.js, backend/utils/validators/share.validator.js | resolvedExpiryMinutes clamped to 15..30 | Persistent uncontrolled sharing | Implemented |
| SHARE-03 | Share Policy | Enforced low usage limit (1-3) + one-time mode | backend/controllers/record.controller.js, backend/utils/validators/share.validator.js | resolvedMaxUses clamped; oneTimeUse support | Unlimited share-link propagation | Implemented |
| SHARE-04 | Share Policy | Revocation support | backend/controllers/record.controller.js, backend/models/recordShareToken.model.js | revokedAt/revokedBy with revoke endpoint | Continued access after trust withdrawal | Implemented |
| SHARE-05 | Share Policy | Recipient-bound controls | backend/controllers/record.controller.js, backend/utils/validators/share.validator.js | recipientUserId/email mismatch checks | Unauthorized forwarded-link access | Implemented |
| SHARE-06 | Share Lifecycle | Expiry and usage checks at access time | backend/controllers/record.controller.js | checks for revoked/expired/usedCount >= maxUses | Stale or overused link abuse | Implemented |
| SHARE-07 | Share Storage Hygiene | TTL cleanup for expired shares | backend/models/recordShareToken.model.js | expiresAt TTL index expireAfterSeconds: 0 | Orphaned stale share records | Implemented |
| SHARE-08 | Share Forensics | Success and denied share access auditing | backend/controllers/record.controller.js, backend/services/audit.service.js | auditShareAccess logs outcome/reason | Missing incident evidence for share misuse | Implemented |
| AUD-01 | Audit Schema | Rich context fields (role/resource/ip/user-agent/device) | backend/models/auditLog.model.js | schema fields + indexes for investigations | Weak forensic detail | Implemented |
| AUD-02 | Audit Integrity | Audit log immutability | backend/models/auditLog.model.js | pre-hooks block update/delete/replace operations | Tampering with audit evidence | Implemented |
| AUD-03 | Audit Coverage | Auth + file + record/share sensitive actions logged | backend/controllers/auth.controller.js, backend/controllers/file.controller.js, backend/controllers/record.controller.js | logSecurityAudit/logAdminAudit usage | Gaps in security event traceability | Implemented |
| AUD-04 | Log Privacy | Token redaction in request logging | backend/middleware/request.middleware.js | regex redaction for share/token URL patterns | Token leakage in logs | Implemented |
| ENV-01 | Secret Hygiene | Required env checks at startup | backend/utils/env.js | throws on missing mongo/jwt/aes secrets | Running in insecure misconfigured state | Implemented |
| ENV-02 | Deployment Safety | Cookie config mismatch warnings | backend/server.js | warns for SameSite/Secure/domain misconfig in prod | Silent insecure cookie deployment | Implemented |
| ENV-03 | Cloud/File Config | Cloudinary and scanner behavior env-controlled | backend/utils/env.js, backend/utils/cloudinary.js, backend/services/fileScanner.service.js | cloudinaryEnabled and clamavEnabled gates | Unsafe default behavior drift across envs | Config-Dependent |

## Engineering Notes

1. The matrix reflects controls verified in the current codebase.
2. Some controls are config-dependent at runtime (for example real malware scanning requires CLAMAV_ENABLED=true and reachable scanner).
3. For release governance, this matrix can be attached to change-control and compliance evidence packs.

## Suggested Compliance Evidence Bundle

1. Current matrix version (this file).
2. Export of recent audit events for auth, file access, and sharing actions.
3. Deployment env checklist snapshot (without raw secret values).
4. Integration test results for security-critical paths.

Companion release gate checklist:

- docs/security/SECURITY_EVIDENCE_CHECKLIST.md
