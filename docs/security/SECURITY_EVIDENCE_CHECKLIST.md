# VitaCollab Security Evidence Checklist

Audience: Release Managers, Engineering Leads, Security, Compliance, QA
Use: Complete before every production deployment
Date: 2026-03-25

## How to Use This Checklist

1. Assign one owner per section.
2. Capture evidence links or artifacts for every check.
3. Mark each item as PASS, FAIL, or N/A.
4. Block production release if any required item is FAIL.

## Release Metadata

- Release version:
- Environment: staging / production
- Change window:
- Release owner:
- Security reviewer:
- Compliance reviewer:
- Ticket or change request ID:

## Required Evidence Artifacts

1. Build and test summary.
2. Security-critical integration test results.
3. Environment configuration snapshot (without secret values).
4. Audit event export sample for sensitive actions.
5. Rollback plan and owner confirmation.

## Section A: Identity and Session Security

Owner:
Evidence folder or links:

- [ ] Access token lifetime is set per policy (default short-lived). Status:
- [ ] Refresh token lifetime is set per policy. Status:
- [ ] Refresh cookie is HttpOnly and Secure in production. Status:
- [ ] Refresh cookie SameSite and Domain values are validated for deployment topology. Status:
- [ ] Refresh token rotation is verified in staging. Status:
- [ ] Refresh mismatch invalidates session (negative test). Status:
- [ ] Blocked and suspended account behavior is validated. Status:
- [ ] Admin permission checks are validated for critical admin endpoints. Status:

Release gate for Section A: all required checks must be PASS.

## Section B: API and Request Hardening

Owner:
Evidence folder or links:

- [ ] Helmet is enabled in runtime. Status:
- [ ] CORS origin allowlist matches approved frontend origins. Status:
- [ ] Global API rate limit is active. Status:
- [ ] Sensitive endpoint rate limits are active (auth, share, review). Status:
- [ ] Zod validation is applied to public and sensitive routes. Status:
- [ ] HPP and Mongo sanitize middleware are enabled. Status:
- [ ] Request payload limits are enforced. Status:
- [ ] Token redaction in request logs is validated. Status:

Release gate for Section B: all required checks must be PASS.

## Section C: Data Protection and Secret Handling

Owner:
Evidence folder or links:

- [ ] Password hashing behavior is validated (no plain-text storage). Status:
- [ ] Token hashing at rest is validated (refresh, reset, verification, share). Status:
- [ ] AES secret is configured and not a placeholder value. Status:
- [ ] Sensitive encrypted fields can be decrypted by app in staging. Status:
- [ ] Required startup env checks pass in target environment. Status:
- [ ] No secrets are committed in release diff or generated artifacts. Status:
- [ ] Secret rotation window is documented if rotation is in scope. Status:

Release gate for Section C: all required checks must be PASS.

## Section D: File Upload and Access Security

Owner:
Evidence folder or links:

- [ ] Upload allowlist is enforced (extension and MIME). Status:
- [ ] Magic-byte validation is tested with mismatched file content. Status:
- [ ] Executable signature blocking is validated. Status:
- [ ] Max upload size policy is enforced. Status:
- [ ] Scanner mode is validated for this environment (mock or real). Status:
- [ ] If CLAMAV_ENABLED=true, scanner connectivity and fail-closed behavior are validated. Status:
- [ ] File access endpoint requires authentication and authorization. Status:
- [ ] Signed URL expiry behavior is validated in UI (countdown and refresh path). Status:
- [ ] Permanent public file URL exposure check passed. Status:

Release gate for Section D: all required checks must be PASS.

## Section E: Share System Security

Owner:
Evidence folder or links:

- [ ] Share tokens are random and only hash is stored in DB. Status:
- [ ] Expiry policy is enforced (short validity window). Status:
- [ ] Usage limits are enforced (including one-time mode). Status:
- [ ] Revocation flow is validated. Status:
- [ ] Recipient-bound validation is tested (authorized and unauthorized). Status:
- [ ] Share access limiter is active. Status:
- [ ] Share denied outcomes produce correct error messages. Status:
- [ ] Share access denied and success audit events are present. Status:

Release gate for Section E: all required checks must be PASS.

## Section F: Audit and Monitoring Evidence

Owner:
Evidence folder or links:

- [ ] Auth events are logged (login and logout). Status:
- [ ] File access events are logged (file_view and file_download). Status:
- [ ] Record and share lifecycle events are logged. Status:
- [ ] Audit records include role, resource, IP, and user-agent fields. Status:
- [ ] Audit immutability protections are validated. Status:
- [ ] Admin audit filters are tested (action, role, resourceId, date range). Status:
- [ ] Alerting or monitoring channel for security failures is reviewed. Status:

Release gate for Section F: all required checks must be PASS.

## Section G: Operational Readiness

Owner:
Evidence folder or links:

- [ ] Rollback plan is documented and approved. Status:
- [ ] On-call security contact is confirmed for release window. Status:
- [ ] Incident runbook link is verified. Status:
- [ ] Data backup and restore posture is confirmed. Status:
- [ ] Post-release security verification tasks are scheduled. Status:

Release gate for Section G: all required checks must be PASS.

## Final Sign-Off

- Engineering lead sign-off:
- Security sign-off:
- Compliance sign-off:
- Release manager sign-off:
- Go or No-Go decision:

## Appendix: Suggested Evidence Sources

1. Runtime config logs for cookie and CORS settings.
2. Staging test reports for auth, share, and file negative and positive paths.
3. Audit log extracts for recent test actions.
4. CI pipeline output and artifact checksums.
5. Change request approvals and release notes.
