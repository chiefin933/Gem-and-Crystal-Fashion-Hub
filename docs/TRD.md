# Technical Requirements Document (TRD)

## Gem & Crystal Fashion Hub Platform

**Version:** 1.0 — pre-launch baseline  
**Date:** 4 September 2026  
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
| `POST /api/orders` | Public, rate limited | Creates online order and starts M-Pesa when configured. |
| `POST /api/pos/checkout` | Approved POS session | Creates in-store sale and starts M-Pesa when selected. |
| `POST /api/orders/mpesa-callback` | Callback secret + strict validation | Confirms or fails an M-Pesa result. |
| `GET /api/pos/payment-notifications` | Approved POS session | Delivers and acknowledges verified payment popups. |
| `GET /api/orders/:orderNumber` | Order tracking token | Returns only the customer’s own order data. |
| `/api/products`, `/api/coupons`, `/api/settings` | Public read / owner write | Product, promotion and store configuration. |
| `/api/admin` and owner routes | Owner token | Administration, inventory and reporting. |

## 7. Callback validation

The API must reject or hold for review any callback that does not meet all of these rules:

- M-Pesa integration is configured.
- Callback secret matches using constant-time comparison.
- Payload has the expected shape.
- Checkout and merchant request IDs match a request created by this API.
- Successful callback includes a valid receipt.
- Amount and normalized payer phone match the pending record.
- Receipt and request IDs have unique database constraints.

## 8. Failure and recovery

| Situation | Required behaviour |
| --- | --- |
| Customer cancels/payment fails | Mark payment `FAILED`; restore stock once; audit the result. |
| Amount, phone or ID mismatch | Keep pending; write review log; show no POS popup. |
| POS temporarily offline | Keep notification until it is acknowledged after reconnect. |
| Daraja unavailable | Keep transaction pending; never claim it was paid. |
| Duplicate callback | Return safe idempotent response; no duplicate stock movement or alert. |

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
