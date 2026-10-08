# Technical Requirements Document (TRD)

## Gem & Crystal Fashion Hub Platform

**Version:** 1.4 - payment diagnostics and cashier monitoring

**Date:** 8 October 2026
**Scope:** Storefront, API, admin dashboard, POS, inventory and payments

## 1. Architecture

The platform consists of three React applications and one Express API backed by PostgreSQL.

| Component | Responsibility | Trust level |
| --- | --- | --- |
| Storefront | Customer catalogue, cart and checkout. | Untrusted browser client |
| Admin dashboard | Owner product, order, inventory, coupon and POS control. | Authenticated owner client |
| Dedicated POS | Cashier sign-in, catalogue, counter sale and payment alerts. | Authenticated POS client |
| API | Authentication, price calculation, inventory, orders, payments and sessions. | System authority |
| PostgreSQL | Products, variants, orders, sales, stock movements, sessions and audit logs. | System of record |
| Safaricom Daraja | M-Pesa STK prompts and provider callback results. | External provider |

## 2. Application locations and local ports

| Application | Folder | Port |
| --- | --- | --- |
| Storefront | `Gem & Crystal Fashion Hub` | 5173 |
| API | `gem-crystal-api` | 4000 |
| Admin | `gem-crystal-admin` | 5174 |
| POS | `gem-crystal-pos` | 5175 |

## 3. Core technical rules

- The API calculates all checkout/POS prices, discounts and totals from database records.
- A product variant is the sellable unit; it has SKU, size, colour, price, optional sale price and stock quantity.
- Conditional database stock updates prevent stock from becoming negative.
- Every stock change is written to `InventoryMovement` with an actor and reference.
- Owner routes require an owner token. Cashier POS sessions require an approved, expiring session token.
- Client applications cannot mark orders or POS sales as paid directly.

## 4. Payment flow

1. Storefront or POS sends variant IDs, quantities, customer details and M-Pesa phone to the API.
2. API validates input, calculates totals, reserves stock and creates a `PENDING` order or POS sale.
3. API starts the Daraja STK request and stores `CheckoutRequestID` and `MerchantRequestID`.
4. Customer approves or cancels payment on their M-Pesa phone.
5. Daraja calls the protected API callback URL.
6. API validates callback secret, result, request IDs, amount, phone and receipt.
7. API marks the record `PAID` and creates one durable `PaymentNotification` record in the same transaction.
8. Authenticated POS polls for notifications every three seconds and displays the payment popup once.

## 5. Main data model

| Entity | Important fields | Purpose |
| --- | --- | --- |
| Product / Variant | SKU, size, colour, price, sale price, stock quantity, active flag | Catalogue and stock authority |
| Order | Customer details, item snapshots, totals, payment and fulfilment status | Website order lifecycle |
| PosSale | Cashier, item snapshots, totals, payment status | Physical-store sale lifecycle |
| PaymentNotification | Unique order/sale reference, amount, receipt, acknowledgement timestamp | One-time POS alert queue |
| InventoryMovement | Variant, quantity, old/new stock, reason, reference, actor | Stock audit trail |
| AuditLog | Action, actor, details, source IP, timestamp | Security and operations audit |

## 6. Important API endpoints

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /api/orders` | Public, rate limited | Creates a pending checkout session for customer Till payment. |
| `POST /api/pos/checkout` | Approved POS session | Creates a pending M-Pesa sale, or completes a cash sale. |
| `POST /api/orders/mpesa-c2b-register` | Owner | Registers encoded confirmation and validation URLs; requires an explicit successful provider response code. |
| `POST /api/orders/c2b-callback` | C2B secret + strict validation | Records a verified C2B payment or queues it for owner review. |
| `POST /api/orders/c2b-callback/validation` | C2B secret + strict validation | Validates callback format and merchant without settling payment. |
| `POST /api/orders/mpesa-callback` | STK secret + strict validation | Legacy STK callback; separate from the Till flow. |
| `GET /api/pos/payment-notifications` | Approved POS session | Reads unacknowledged alerts belonging to the cashier; does not acknowledge them. |
| `POST /api/pos/payment-notifications/:id/acknowledge` | Same cashier | Acknowledges a notification only after sale completion. |
| `GET /api/orders/:orderNumber` | Order tracking token | Returns only the customer’s own order data. |
| `/api/products`, `/api/coupons`, `/api/settings` | Public read / owner write | Product, promotion and store configuration. |
| `/api/admin` and owner routes | Owner token | Administration, inventory and reporting. |

## 7. Callback validation

The API must reject or hold for review any callback that does not meet all of these rules:

- M-Pesa integration is configured.
- Callback secret matches using constant-time comparison.
- Payload has the expected shape.
- C2B BusinessShortCode matches deployment configuration; STK callbacks separately match checkout and merchant request IDs.
- Successful callback includes a valid receipt that has not paid another transaction.
- C2B BillRefNumber (or AccountReference) matches the checkout or sale reference and the amount matches exactly in cents.
- The target remains open and within its payment window; otherwise retain the payment for owner review.
- Masked or hashed C2B payer identities are accepted as opaque identifiers, not used as phone-based payment matching.

## 8. Failure and recovery

| Situation | Required behaviour |
| --- | --- |
| Customer cancels/payment fails | Mark payment `FAILED`; restore stock once; audit the result. |
| C2B missing reference, wrong amount or expired target | Store verified payment in Unmatched Payments; show no paid popup until reviewed and assigned. |
| POS temporarily offline | Keep notification until it is acknowledged after reconnect. |
| Daraja unavailable | Keep transaction pending; never claim it was paid. |
| Duplicate callback | Return safe idempotent response; no duplicate stock movement or alert. |

POS payment polling uses one request at a time, a 15-second abort timeout and a three-second retry delay after completion. HTTP errors, network errors and malformed notification responses produce a visible warning; HTTP 401 ends the shift. A successful poll clears the warning. Requests are aborted when the session changes to avoid stale-session alerts.

Daraja registration must return ResponseCode `0` or `00000000`; HTTP 200 alone is insufficient. Registration errors must not create a successful-registration audit entry. Callback diagnostics log arrival and completion metadata without secrets or payloads. Diagnostic outcome `processed` means the handler completed, not necessarily that a sale was matched; verify the database audit and notification record.

## 9. Security requirements

- Use HTTPS in production, especially for M-Pesa callback URL.
- Put `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY` and `MPESA_CALLBACK_SECRET` in deployment secrets—not Git.
- Use separate strong secrets for application JWT, POS sessions and M-Pesa callback validation.
- Use strict input validation, payload size limits, Helmet, CORS origin allow-list and rate limiting.
- Keep admin and POS browser tokens in memory where practical; do not expose order data using predictable order numbers alone.
- Never log secrets or access tokens.

## 10. Required production configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Owner authentication token signing |
| `POS_SESSION_SECRET` | POS session token derivation |
| `STOREFRONT_URL`, `ADMIN_URL`, `POS_URL` | Production CORS allow-list |
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET` | Daraja OAuth credentials |
| `MPESA_SHORTCODE`, `MPESA_PASSKEY` | STK request credentials |
| `MPESA_CALLBACK_URL`, `MPESA_CALLBACK_SECRET` | Protected callback configuration |

## 11. Verification before launch

1. Build all four applications.
2. Apply Prisma schema updates and back up production database first.
3. Test website payment success, cancellation, invalid callback and callback retry.
4. Test physical POS payment success and popup.
5. Test POS reconnect after payment confirmation.
6. Test concurrent stock requests and unauthorised admin/POS requests.
7. Confirm no real credentials are committed to Git.

## 12. Storefront presentation and data contracts

- Implement the four-slide campaign in the existing React storefront, below the navigation rather than replacing header shopping controls. Slides represent women, men, sneakers and new arrivals and preserve the brand headline and bold slogan.
- Keep image dimensions stable and use object-fit: cover with per-slide focal positions to fill frames without distortion or blank bands. Prefer catalogue-derived product photography where available; promotional fallback photography must not create catalogue records or assert prices/stock.
- Apply contrast-safe foreground/overlay styling when live catalogue photos replace campaign images. Verify light, dark and busy backgrounds on desktop and phones while keeping merchandise visible.
- Use labelled native buttons for previous/next, slide selection and explicit pause/play. Start rotation automatically every five seconds; pointer hover and touch/pointer-selected controls must not stop it indefinitely. Track actual keyboard input rather than inferring it from pointer-triggered focus-visible. Clear timers on unmount and pause for hidden documents. Reduced motion disables animated transitions, not automatic instant slide changes or enabled Pause/Play. Motion transitions must not expose offscreen slide controls to keyboard or screen-reader users.
- Mobile photo-frame sizing and focal positions must show the garment/shoes in actual portrait catalogue photos. Do not reuse the shallow 130px, top-aligned crop that showed mostly background in the phone recording. Keep these layout corrections within mobile breakpoints and preserve approved desktop appearance.
- Mobile carousel controls must sit above transparent campaign text layers in the stacking order. Verify elementFromPoint at each control centre and native touch activation; visible buttons or programmatic click handlers alone do not prove the controls can receive taps.
- Slide actions must reset incompatible catalogue filters and navigate to the appropriate assortment. New-arrival discovery must use actual catalogue metadata, not invented launch dates.
- The catalogue service has no development or environment-enabled demo fallback. Official category and branch configuration lives in src/utils/storeConfig.ts. Remove the unused fake authentication provider; customer screens cannot grant owner privileges.
- Fixed circular support controls use accessible names, device safe-area insets and bottom page clearance. Modal-aware visibility prevents them covering cart, checkout or chat actions.
- Constrain the mobile assistant with viewport-relative maximum height and inset width, including short viewports. Its header and composer remain reachable while messages scroll internally. Preserve keyboard focus, Escape dismissal and the existing chat API integration.
- Footer year is the literal 2023. Do not derive it from the runtime clock.
- Verify desktop, 320px and 390px phone widths, short viewports, all slide navigation/filter actions, rotation controls, assistant open/close/send layout, empty/unavailable catalogue and reduced-motion behaviour.
- Update Markdown requirements, sharing copies and project documentation alongside code changes. Build/lint/unit and browser checks do not replace live merchant payment verification.
