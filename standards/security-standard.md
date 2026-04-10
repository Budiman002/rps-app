# Security Development Standard

> **Scope**: This is a comprehensive security standard that MUST be followed when developing, reviewing, or modifying any code. It applies to all languages, frameworks, and platforms. Compliance is mandatory — not optional.

> **Golden Rule**: Never execute the code (`dotnet build`, `npm run dev`, etc.). Only write code; the owner runs it on the appropriate server.

---

## 1. Cryptography & TLS

### 1.1 Algorithms & Modes

| Category | Approved | Banned |
|---|---|---|
| **Symmetric** | AES-GCM, ChaCha20-Poly1305 | ECB, DES, 3DES, RC2, RC4, Blowfish |
| **Asymmetric** | RSA ≥2048, ECC (Curve25519, Ed25519, P-256+) | RSA <2048, static RSA key exchange |
| **Hashing** | SHA-256, SHA-384, SHA-512 | MD2, MD4, MD5, SHA-0, SHA-1 |
| **Password Hashing** | Argon2id, scrypt, bcrypt (cost≥10), PBKDF2-HMAC-SHA-256 | MD5, SHA-1, plain SHA-256 (unsalted) |
| **RNG** | CSPRNG only (SecureRandom, crypto.randomBytes, secrets) | Math.random, System.Random, rand() |
| **Key Exchange** | ECDHE, DHE with validated groups | Anonymous DH, static RSA |

### 1.2 Key Management
- Generate keys in validated modules (HSM/KMS). Never from passwords or predictable inputs.
- Separate keys by purpose (encryption vs. signing vs. wrapping).
- Store in KMS/HSM/vault. **NEVER** hardcode. Avoid plain environment variables.
- Use KEK to wrap DEKs. Store separately. Rotate on compromise or policy.
- Audit all key access and operations.

### 1.3 Data at Rest
- Encrypt sensitive data; minimize stored secrets; tokenize where possible.
- Use authenticated encryption (AEAD). Manage nonces/IVs properly; keep salts unique per item.
- Protect backups: encrypt, restrict access, test restores, manage retention.

### 1.4 TLS Configuration
- TLS 1.3 preferred. Allow TLS 1.2 only for legacy. **Disable** TLS 1.0/1.1 and SSL.
- Prefer AEAD cipher suites. Disable NULL/EXPORT/anon.
- Certificates: 2048-bit+ keys, SHA-256, correct CN/SAN.
- HTTPS site-wide. Redirect HTTP→HTTPS. Prevent mixed content. Set cookies `Secure`.

### 1.5 HSTS
- Send `Strict-Transport-Security` only over HTTPS.
- Test: `max-age=86400` with `includeSubDomains`.
- Production: `max-age=31536000` (≥1 year) with `includeSubDomains`.
- Consider `preload` once stable.

---

## 2. Authentication & MFA

### 2.1 Password Policy
- Accept passphrases and full Unicode. Minimum 8 characters. Reasonable maximum (64+).
- Check against breach corpora (k-anonymity APIs). Reject common/breached passwords.
- Hash with Argon2id (preferred), scrypt, bcrypt, or PBKDF2. **NEVER** encrypt passwords.
- Use unique per-user salts. Constant-time comparison.

### 2.2 Authentication Flow
- Enforce TLS for all auth endpoints.
- Generic error messages: "Invalid username or password" (prevent enumeration).
- Implement rate limits per IP, account, and globally.
- Progressive backoff for lockouts; avoid permanent lockout.

### 2.3 Multi-Factor Authentication (MFA)
- Phishing-resistant factors preferred: WebAuthn/Passkeys (FIDO2), hardware U2F.
- Acceptable: TOTP (app-based). Avoid: SMS/voice, email codes, security questions.
- Require MFA for: login, password changes, privilege elevation, high-value transactions.
- Provide single-use backup codes for recovery.

### 2.4 OAuth 2.0 / OIDC / SAML
- Use standard protocols only — **never build custom auth schemes**.
- Prefer Authorization Code with PKCE for public/native apps.
- Validate `state` and `nonce`. Exact redirect URI matching.
- Short-lived tokens. Rotate refresh tokens. Revoke on logout.

### 2.5 Token Security (JWT / Opaque)
- Pin algorithms. Reject `"none"`. Validate `iss/aud/exp/iat/nbf`.
- Short lifetimes. Implement revocation (denylist/allowlist).
- Store keys in KMS/HSM. **NEVER** hardcode JWT secrets.

---

## 3. Authorization & Access Control

### 3.1 Core Principles
1. **Deny by default**: Return 403 when no allow rule matches.
2. **Least privilege**: Grant minimum required access.
3. **Validate every request**: Check authorization for every request (AJAX, API, direct).
4. **Prefer ABAC/ReBAC over RBAC** for fine-grained permissions.

### 3.2 Preventing IDOR
- Never trust user-supplied identifiers alone. Verify access per object instance.
- Resolve via user-scoped queries: `currentUser.projects.find(id)` NOT `Project.find(id)`.
- Use non-enumerable identifiers (UUIDs) as defense-in-depth.

### 3.3 Preventing Mass Assignment
- NEVER bind request bodies directly to domain objects.
- Expose only safe fields via DTOs with explicit allow-lists.
- Use framework features to block sensitive fields.

### 3.4 Transaction Authorization
- Require step-up authentication for sensitive operations.
- Use unique, time-limited credentials per transaction.
- Enforce server-side; prevent client-side downgrades.

---

## 4. Input Validation & Injection Defense

### 4.1 Core Strategy
- Validate early at trust boundaries with positive (allow-list) validation.
- Treat all untrusted input as data, **never as code**.
- Parameterize queries/commands. Escape only as last resort.

### 4.2 SQL Injection Prevention
- **100% parameterized queries**. Use prepared statements / ORM bind parameters.
- **NEVER** concatenate user input into SQL strings.
- Use least-privilege database accounts.

### 4.3 OS Command Injection
- Prefer built-in APIs over shell execution.
- If unavoidable, use structured execution (ProcessBuilder, etc.) — not shell invocation.
- Allow-list commands and arguments.

### 4.4 LDAP Injection
- Apply context-appropriate escaping (DN escaping, filter escaping).
- Validate inputs with allow-lists before constructing queries.

### 4.5 Prototype Pollution (JavaScript)
- Use `new Map()` / `new Set()` instead of object literals.
- Create objects with `Object.create(null)` or `{ __proto__: null }`.
- Block `__proto__`, `constructor`, `prototype` in deep merge utilities.

---

## 5. Client-Side Web Security

### 5.1 XSS Prevention
- HTML context: prefer `textContent`. Use DOMPurify with strict allow-lists.
- Attribute context: always quote and encode.
- JavaScript context: **NEVER** build JS from untrusted strings. No `eval()`, no `innerHTML`.
- URL context: validate protocol/domain. Block `javascript:`.
- Redirects: validate against trusted domain allow-lists.

### 5.2 Content Security Policy (CSP)
- Prefer nonce-based or hash-based CSP.
- Start with Report-Only mode, then enforce.
- Baseline: `default-src 'self'; script-src 'self' 'nonce-{random}'; object-src 'none'; base-uri 'self'`.

### 5.3 CSRF Defense
- Use framework-native CSRF tokens on all state-changing requests.
- Cookie settings: `SameSite=Lax` or `Strict`; `Secure`; `HttpOnly`.
- **NEVER** use GET for state changes.

### 5.4 Clickjacking Defense
- `Content-Security-Policy: frame-ancestors 'none'` or specific allow-list.
- Fallback: `X-Frame-Options: DENY` or `SAMEORIGIN`.

### 5.5 HTTP Security Headers

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` or `DENY` | Clickjacking protection |
| `Referrer-Policy` | `origin-when-cross-origin` | Limit referrer info |
| `Permissions-Policy` | Restrict all unused APIs | Limit browser features |
| `Content-Security-Policy` | Strict policy | XSS mitigation |

### 5.6 Client Storage
- **NEVER** store secrets in `localStorage`/`sessionStorage`.
- Prefer HttpOnly cookies for token transport.
- Add `rel="noopener noreferrer"` to external `target="_blank"` links.

---

## 6. API & Web Services Security

### 6.1 Transport
- HTTPS only. Consider mTLS for high-value/internal services.

### 6.2 Authentication
- Use OAuth 2.0/OIDC for client auth. For services: mTLS or signed tokens.
- API keys: scope narrowly, rate limit, monitor. **NEVER** use alone for sensitive operations.

### 6.3 Input Handling
- Validate via contracts (OpenAPI/JSON Schema). Reject unknown fields.
- Enforce explicit `Content-Type`/`Accept`. Set payload size limits.
- Harden XML parsers against XXE/entity expansion.

### 6.4 Rate Limiting & DoS
- Per-IP/user/client limits. Circuit breakers. Timeouts.
- Server-side batching and caching to reduce load.

### 6.5 SSRF Prevention
- Do NOT accept raw URLs from users.
- Validate domains/IPs. Block private/link-local/localhost ranges.
- Restrict to HTTP/HTTPS only (block `file://`, `gopher://`, `ftp://`).

---

## 7. Session Management & Cookies

### 7.1 Session IDs
- Generate with CSPRNG (≥128 bits entropy). Opaque, unguessable.
- Store all session data server-side. Never embed PII in tokens.

### 7.2 Cookie Configuration
```
Set-Cookie: id=<opaque>; Secure; HttpOnly; SameSite=Strict; Path=/
```
- `Secure`: HTTPS only.
- `HttpOnly`: No JavaScript access.
- `SameSite=Strict` (or `Lax`).
- Scope narrowly with `Path` and `Domain`.

### 7.3 Session Lifecycle
- Regenerate session ID on authentication and privilege changes.
- Idle timeout: 2–5 min (high-value) / 15–30 min (lower risk).
- Absolute timeout: 4–8 hours.
- Full logout must invalidate server session and clear cookie.

---

## 8. Data & Database Security

### 8.1 Database Protection
- Isolate database servers. Disable network access when possible.
- NEVER allow direct connections from clients to backend database.
- TLS for all database connections. Verify certificates.

### 8.2 Authentication
- Always require authentication (including local connections).
- Dedicated accounts per application/service. Minimum required permissions.
- **NEVER** use admin/root/sa accounts for applications.

### 8.3 Credential Storage
- **NEVER** store credentials in source code.
- Store in configuration outside web root, or use secrets management.
- **NEVER** check credential files into source control.

### 8.4 Permissions
- Apply least privilege to all database accounts.
- Separate accounts for Dev, UAT, and Production.
- Implement row-level and column-level security when needed.

---

## 9. File Handling & Uploads

### 9.1 Validation
- Allow-list file extensions (not deny-list).
- Validate file signatures (magic numbers). **NEVER** trust `Content-Type` alone.
- Generate random filenames (UUID/GUID). Restrict characters.

### 9.2 Storage
- Store outside web root. Use application handlers for access.
- Require authentication before upload/download.
- Set file size limits. Consider post-decompression size limits.

### 9.3 Content Safety
- Scan for malware. Consider CDR (Content Disarm & Reconstruct).
- Rewrite images to destroy malicious content.
- Log and monitor upload activities.

---

## 10. Logging & Monitoring

### 10.1 What to Log
- Authentication/authorization events. Admin actions. Config changes.
- Sensitive data access. Input validation failures. Security errors.
- Include: correlation IDs, user IDs (non-PII), source IP, timestamps (UTC).

### 10.2 How to Log
- Structured logs (JSON). Stable field names.
- Sanitize inputs to prevent log injection (strip CR/LF/delimiters).
- **NEVER** log: credentials, tokens, recovery codes, raw session IDs, PII.

### 10.3 Storage
- Append-only or WORM storage. Tamper detection.
- Centralized aggregation. Access controls. Retention policies.
- Store outside web-accessible locations.

---

## 11. DevOps, CI/CD, & Containers

### 11.1 Pipeline Security
- Protected branches. Mandatory reviews. Signed commits.
- Secrets: **NEVER** hardcode. Fetch at runtime from vault/KMS. Mask in logs.
- Security gates: SAST, SCA, DAST, IaC scanning. Block on critical findings.
- Pin dependencies via lockfiles. Verify integrity.

### 11.2 Docker Hardening
- Run as non-root. Set `USER` in Dockerfile.
- `--cap-drop all`. **NEVER** use `--privileged`.
- **NEVER** mount Docker socket (`/var/run/docker.sock`).
- Read-only root filesystem. Resource limits (CPU/memory).
- Minimal base images (distroless/alpine). Pin tags and digests.
- Scan images on build. Block high-severity vulnerabilities.

### 11.3 Node.js in Containers
- `npm ci --omit=dev` for deterministic builds.
- `ENV NODE_ENV=production`.
- Non-root user. Proper init system (`dumb-init`). Graceful shutdown.
- Multi-stage builds. Use `.dockerignore`.

---

## 12. Supply Chain Security

### 12.1 Dependency Management
- Maintain lockfiles. Pin versions. Verify integrity.
- Regular audits (`npm audit`, NuGet audit). Patch within SLA by severity.
- Minimize dependency footprint. Remove unused packages.
- Use private registries. Enable 2FA for publishing.

### 12.2 SBOM & Provenance
- Generate Software Bill of Materials for apps/images.
- Attest provenance (SLSA, Sigstore).
- Sign artifacts. Verify signatures at deploy.

---

## 13. Hardcoded Credentials — STRICTLY FORBIDDEN

### Patterns to Recognize and Block

| Category | Examples |
|---|---|
| **AWS Keys** | `AKIA...`, `AGPA...`, `ASIA...` |
| **Stripe Keys** | `sk_live_...`, `pk_live_...` |
| **Google API** | `AIza` + 35 chars |
| **GitHub Tokens** | `ghp_...`, `gho_...`, `ghs_...` |
| **JWTs** | `eyJ...` (three base64 sections) |
| **Private Keys** | `-----BEGIN ... PRIVATE KEY-----` |
| **Connection Strings** | `mongodb://user:pass@host`, `Server=...;Password=...` |

### Warning Signs
- Variable names containing: `password`, `secret`, `key`, `token`, `auth`.
- Long random-looking strings near authentication code.
- Base64-encoded strings near auth logic.

### Required Action
- Store in secrets manager, Key Vault, or environment-specific configuration.
- Use `dotnet user-secrets` for .NET local development.
- Use `.env.local` (git-ignored) for Node.js local development.

---

## 14. XML & Serialization

### 14.1 XML Parser Hardening
- Disable DTDs and external entities by default.
- Validate against local, trusted schemas.
- Set limits (size, depth, element counts).

### 14.2 Safe Deserialization
- **NEVER** deserialize untrusted native objects.
- Prefer JSON with schema validation.
- Avoid: `BinaryFormatter` (.NET), `pickle` (Python), `unserialize()` (PHP).
- Use: `System.Text.Json` (.NET), `json_decode()` (PHP), `yaml.safe_load` (Python).

---

## 15. Framework-Specific Security

### 15.1 .NET (ASP.NET Core)
- Keep runtime and NuGet packages updated.
- Use `[Authorize]` attributes. Perform server-side authorization checks.
- Anti-forgery tokens on state-changing actions.
- Enforce HTTPS redirects. Remove version headers. Set CSP/HSTS.
- Use parameterized SQL. Validate with allow-lists.

### 15.2 Node.js / Next.js
- Limit request sizes. Validate and sanitize input.
- Avoid `eval`, `child_process.exec` with user input.
- Use `helmet` for headers. Rate limit auth endpoints.
- Cookies: `secure`, `httpOnly`, `sameSite`. `NODE_ENV=production`.
- Keep packages updated. Run `npm audit`. Use security linters.

### 15.3 Python (FastAPI)
- Protect all internal API endpoints (shared secret / mTLS).
- SQL injection: use parameter binding with SQLAlchemy `text()`.
- Secrets: load from environment (Pydantic `BaseSettings`). **NEVER** hardcode.
- Use `HTTPException` for API errors.

---

## 16. Digital Certificate Checks

When encountering X.509 certificate data:

1. **Expiration**: Flag expired or not-yet-valid certificates as CRITICAL.
2. **Key Strength**: Flag RSA < 2048-bit or ECC < P-256 as HIGH.
3. **Signature Algorithm**: Flag MD5 or SHA-1 signatures as HIGH.
4. **Self-Signed**: Flag as INFORMATIONAL — acceptable only for dev/testing.

---

## 17. Implementation Checklist

### Cryptography
- [ ] AEAD encryption everywhere. Vetted libraries only. No custom crypto.
- [ ] Keys in KMS/HSM. Purpose-scoped. Rotation documented.
- [ ] TLS 1.3/1.2 with strong ciphers. Compression off.
- [ ] HSTS deployed. Mixed content eliminated.

### Authentication
- [ ] Argon2id for password hashing. Per-user salt. Constant-time verify.
- [ ] MFA implemented for high-risk operations.
- [ ] OAuth 2.0 + PKCE for auth flows. Token rotation implemented.
- [ ] Rate limits on auth endpoints. Uniform error responses.

### Authorization
- [ ] Deny-by-default enforced on every endpoint.
- [ ] Query scoping prevents cross-tenant data access.
- [ ] DTOs prevent mass assignment.
- [ ] Authorization matrix drives CI tests.

### Client-Side
- [ ] Contextual XSS encoding/sanitization for every sink.
- [ ] CSP with nonces. Violations monitored.
- [ ] CSRF tokens on all state-changing requests.
- [ ] Security headers configured and validated.

### API
- [ ] HTTPS/mTLS configured. Certs managed.
- [ ] Contract validation at edge. Unknown fields rejected.
- [ ] Rate limiting and circuit breakers in place.
- [ ] SSRF protections at app and network layers.

### Infrastructure
- [ ] Pipeline secrets in vault. Ephemeral runners. Security scans in CI.
- [ ] Containers: non-root, least privilege, read-only FS, scanned images.
- [ ] Lockfiles present. SBOM generated. Dependencies audited.
- [ ] No hardcoded credentials in source code. Verified by automated scans.
