# Gem & Crystal Security Hardening Report

## Executive summary

The API already has several strong controls: role checks are server-side, admin tokens have issuer/audience validation, CORS is allowlisted, Helmet is enabled, payment callbacks use a secret, uploads require OWNER role, and login/POS PIN routes are rate-limited. No `.env` or private-key files are tracked in the four repositories.

Before production, fix the high-severity upload dependency and remove the remaining client-side/demo identity paths. Then add narrow rate limits, input schemas, and production edge headers.

## High

### SEC-01 — Vulnerable multipart upload dependency

- Rule ID: EXPRESS-DEPS-001 / EXPRESS-UPLOAD-001
- Severity: High
- Location: `/home/johnte/Desktop/gem-crystal-api/package.json:26`; upload route `/home/johnte/Desktop/gem-crystal-api/src/routes/upload.ts:10-19,85`
- Evidence: `multer` is pinned to `^2.2.0`; `npm audit --omit=dev` reports three high-severity denial-of-service advisories affecting versions below 2.3.0, including the installed 2.2.0.
- Impact: A crafted multipart request can exhaust resources or leak file descriptors, making the API unavailable. The route is owner-protected, but a stolen token or upstream request parsing weakness still makes this worth fixing before production.
- Fix: Upgrade Multer to a patched release (2.3.0 or newer), refresh the lockfile, retain the existing file-count/size/type/signature checks, and run upload regression tests.
- Mitigation: Rate-limit the upload endpoint and enforce request-size limits at the reverse proxy/CDN.
- False-positive notes: None; npm audit identifies the installed version.

### SEC-02 — Browser-side demo administrator identity remains in the storefront

- Rule ID: REACT-AUTHZ-001 / REACT-CONFIG-001
- Severity: High
- Location: `/home/johnte/Desktop/Gem & Crystal Fashion Hub/src/context/AuthContext.tsx:18-36,61-80`
- Evidence: The storefront contains a `DEMO_ADMIN` object and sets it when an email equals or contains `admin`; it also defaults visitors to a demo customer profile.
- Impact: Anyone can present themselves as an admin in the storefront UI. The scan found no privileged API call from this UI, so it is not currently backend takeover; however, shipping this creates a misleading authority boundary and can become a real privilege escalation when UI features change.
- Fix: Remove demo login/registration and demo profiles from production builds. Implement real customer authentication only if that feature is required; keep all owner administration in the authenticated admin app.
- Mitigation: Gate demo fixtures behind an explicit development-only flag that is compiled out of production.
- False-positive notes: Server owner routes do require a signed token and role, which limits current impact.

## Medium

### SEC-03 — Exact inventory counts are publicly exposed

- Rule ID: EXPRESS-INPUT-001 / REACT-AUTHZ-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-api/src/routes/products.ts:62-75`
- Evidence: Both public product endpoints use `include: { variants: true }`, returning each variant including `stockQuantity`.
- Impact: Competitors and automated scrapers can learn exact stock levels and product/SKU operational detail.
- Fix: Return only public variant fields and a stock signal such as `IN_STOCK`, `LOW_STOCK`, or `OUT_OF_STOCK`. Keep exact quantities for owner/POS endpoints only.
- Mitigation: Add pagination and a public catalogue rate limit.
- False-positive notes: If showing exact stock is a deliberate business feature, document that exception.

### SEC-04 — Several public and costly endpoints have no dedicated abuse limit

- Rule ID: EXPRESS-AUTH-001 / EXPRESS-DOS-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-api/src/index.ts:63-140`; `/home/johnte/Desktop/gem-crystal-api/src/routes/products.ts:22-75`; `/home/johnte/Desktop/gem-crystal-api/src/routes/coupons.ts:53-103`; `/home/johnte/Desktop/gem-crystal-api/src/routes/upload.ts:85`
- Evidence: Limits exist for admin login, POS PIN login, checkout, checkout polling, and AI. Public catalogue search, coupon validation, health probes, POS login-status polling, and uploads have no route-specific limits.
- Impact: Attackers can create unnecessary database work, enumerate coupon validity, or consume upload capacity.
- Fix: Add purpose-specific limits: catalogue read/search, coupon validation, POS status polling, upload, and a conservative generic API ceiling that excludes/appropriately accommodates payment callbacks.
- Mitigation: Apply matching limits at Cloudflare/reverse-proxy level and alert on repeated 429s.
- False-positive notes: Checkout polling and Safaricom callbacks need higher or separate limits to avoid breaking payment flow.

### SEC-05 — Settings and public coupon validation lack strict request schemas

- Rule ID: EXPRESS-INPUT-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-api/src/routes/settings.ts:42-67`; `/home/johnte/Desktop/gem-crystal-api/src/routes/coupons.ts:53-63`
- Evidence: Both routes destructure `req.body` directly; the settings update is privileged but does not enforce types, lengths, or an allowlisted object schema.
- Impact: Invalid or oversized values can cause errors, corrupt expected display data, and make later UI or database behavior less predictable.
- Fix: Add `.strict()` Zod schemas with length, URL/phone, boolean, and monetary constraints; reject unknown fields.
- Mitigation: Keep the global body limits and log validation failures without logging request bodies.
- False-positive notes: Prisma type checks prevent some malformed writes, but do not replace boundary validation.

### SEC-06 — POS admin bearer token is stored in localStorage

- Rule ID: REACT-AUTH-001 / JS-STORAGE-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-pos/src/context/AuthContext.tsx:21-47`; `/home/johnte/Desktop/gem-crystal-pos/src/api/adminApi.ts:4-7`
- Evidence: The owner bearer token is persisted as `gc_admin_token` and read on every request.
- Impact: Any same-origin XSS or local browser compromise can steal a token with owner API access until expiry.
- Fix: Remove the unused owner-dashboard auth flow from the POS build, or migrate owner auth to an HTTPOnly secure cookie with a CSRF design. Keep the cashier POS session in memory and short-lived.
- Mitigation: Enforce CSP and use a dedicated POS origin/device account.
- False-positive notes: The primary cashier session token is kept in React state; this finding concerns the separate POS admin dashboard code path.

### SEC-07 — Long-lived sessions and legacy plaintext-PIN migration code

- Rule ID: EXPRESS-SESS-002 / EXPRESS-AUTH-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-api/src/middleware/auth.ts:85-90`; `/home/johnte/Desktop/gem-crystal-api/src/routes/pos.ts:103-104,360-365,573-605`
- Evidence: Owner JWTs and POS sessions last 12 hours; cashier login accepts a legacy plaintext PIN comparison then hashes it.
- Impact: A stolen session remains usable for up to 12 hours, and legacy plaintext PINs are unsafe if the database is exposed.
- Fix: Migrate all PINs in a controlled one-time process, remove plaintext fallback, introduce an admin token-version/revocation field, shorten owner sessions, and add an idle POS lock (10–15 minutes) requiring cashier PIN to resume.
- Mitigation: Enforce explicit logout at shift end and restrict POS device access.
- False-positive notes: Existing POS approval and server-side session checks are positive controls.

### SEC-08 — Production proxy and static-site headers are not deployment-verified

- Rule ID: EXPRESS-PROXY-001 / REACT-HEADERS-001
- Severity: Medium
- Location: `/home/johnte/Desktop/gem-crystal-api/src/index.ts:24-31`; frontend repositories contain no edge/header configuration.
- Evidence: Production unconditionally trusts one proxy hop; no Nginx, CDN, Vercel, or Cloudflare header configuration is present in the repositories.
- Impact: A wrong deployment topology can make IP-based limits unreliable. The static storefront/admin/POS may also ship without CSP, clickjacking protection, referrer policy, and Permissions Policy.
- Fix: Configure the actual reverse proxy/CDN to overwrite forwarded headers and set explicit security headers. Verify deployed response headers with a production URL before launch.
- Mitigation: Keep `trust proxy` disabled unless the known proxy is in front of the API.
- False-positive notes: These protections may exist outside the repositories; verify with the hosting configuration.

## Low / operational hardening

### SEC-09 — Public catalogue queries are unpaginated and weakly normalized

- Rule ID: EXPRESS-INPUT-001 / EXPRESS-DOS-001
- Severity: Low
- Location: `/home/johnte/Desktop/gem-crystal-api/src/routes/products.ts:24-66`
- Evidence: Raw query values are cast and all matching products/variants are returned.
- Impact: Large catalogues increase database and response cost; malformed numeric filters can create avoidable errors.
- Fix: Use a strict query schema, bound search length and price values, and add cursor/page pagination with a capped page size.
- Mitigation: Cache public catalogue responses at the CDN.
- False-positive notes: Prisma parameterization prevents SQL injection here.

### SEC-10 — No repository-visible CI security gate

- Rule ID: EXPRESS-DEPS-001 / REACT-SUPPLY-001
- Severity: Low
- Location: all four repositories; no CI/deployment configuration found.
- Evidence: Lockfiles and `.env` ignores exist, but no visible `npm ci`, production `npm audit`, secret scanning, or build gate.
- Impact: dependency or secret regressions can reach production unnoticed.
- Fix: Add CI that runs `npm ci`, production dependency audit, TypeScript build, and secret scanning on each change.
- Mitigation: Enable repository dependency alerts and protected branches.
- False-positive notes: An external CI system may exist; it was not visible in these working copies.

## Verified positive controls

- API uses Helmet, disables `X-Powered-By`, sets request-body limits, has custom 404/error handling, and uses explicit CORS origins.
- Admin/owner authorization is enforced on the server and checks the live database role after JWT verification.
- M-PESA callbacks are guarded by a timing-safe callback secret comparison.
- Cashier PIN and owner login have existing brute-force limits; upload route validates file count, size, MIME allowlist, and binary signatures.
- No secret environment or private-key files are tracked by Git in the four repositories.
- Production npm audits are clean for the storefront, admin, and POS. API audit reports the dependency issues described in SEC-01.

## Recommended fix order

1. Upgrade Multer and add upload/public-endpoint rate limits.
2. Remove storefront demo admin/customer authentication before deployment.
3. Hide exact stock counts from public product responses and add query schemas/pagination.
4. Add schemas for settings/coupon validation and session revocation/idle-lock controls.
5. Configure CDN/reverse-proxy headers, TLS, IP forwarding, CI, and secret management before go-live.

