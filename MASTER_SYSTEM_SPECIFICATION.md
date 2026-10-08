# Gem & Crystal Fashion Hub — Master System Specification

**Project:** Gem & Crystal Fashion Hub  
**Location:** Roysambu, Nairobi, Kenya  
**Business Type:** Fashion Boutique — Physical Store + Online Shop  
**Tagline:** BE BOLD. BE BRIGHT. BE YOU.  
**Last Updated:** 2026-10-08
**Status:** Active — Pre-Daraja Sandbox / Pre-Physical-Shop-Test  

---

## Storefront revision October 2026

Phone-recording acceptance now requires taller garment-aware mobile photo frames and touch-safe five-second automatic playback. Reduced motion removes transition animation but keeps instant slide changes and usable Pause/Play. Preserve the approved desktop appearance and verify against deployed catalogue photography.

The current storefront has an automatically advancing four-slide top campaign for women, men, sneakers and new arrivals, with explicit pause/play and photos filling their frames without stretching; API-only catalogue records; explicit variant selection; fixed circular WhatsApp/Gem AI controls; a compact mobile assistant; and a fixed 2023 copyright display. The brand slogan is large and bold across phone and desktop layouts. Keep docs/PRD.md, docs/TRD.md and project documentation synchronized with future changes. Live M-Pesa acceptance and the reported POS popup issue still require verification.

## 1. System Architecture

```
                    GEM & CRYSTAL FASHION HUB
                               │
         ┌─────────────────────┼──────────────────────┐
         │                     │                      │
         ▼                     ▼                      ▼
    STOREFRONT              ADMIN                    POS
  React/Vite/TS          React/Vite/TS          React/Vite/TS
  Roysambu + Kenya         Owner Panel           Cashier Terminal
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                      EXPRESS API (TypeScript)
                      gem-crystal-api / port 4000
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         PostgreSQL        EventBus         AI Service
       gem_crystal_db    (Node EventEmitter)  (OpenRouter)
              │                                  │
           Prisma                         MiniMax M3 (free)
```

### Repositories

| Repo | URL | Purpose |
|------|-----|---------|
| `Gem-and-Crystal-Fashion-Hub` | github.com/chiefin933/Gem-and-Crystal-Fashion-Hub | Customer storefront |
| `gem-crystal-api` | github.com/chiefin933/gem-crystal-api | Central REST API + DB |
| `gem-crystal-admin` | github.com/chiefin933/gem-crystal-admin | Owner dashboard |
| `gem-crystal-pos` | github.com/chiefin933/gem-crystal-pos | Cashier POS terminal |

---

## 2. Core Architectural Rules (Non-Negotiable)

1. **Payment-first order creation** — No `Order` record and no stock deduction may exist until Safaricom confirms the payment. A `CheckoutSession` is created first; the Order is created atomically inside the C2B callback transaction.

2. **Stock deduction timing** — For POS: stock is deducted atomically inside `completeSaleAtomically()` — called at checkout for CASH and after payment confirmation for M-PESA. Never at sale creation. For e-commerce: stock is deducted inside the C2B callback transaction when the Order is created.

3. **Atomic concurrency control** — All stock operations use `UPDATE ... WHERE stockQuantity >= qty RETURNING stockQuantity` (PostgreSQL atomic conditional update). Race conditions between concurrent checkouts are eliminated at the database level.

4. **Server-side pricing authority** — The browser never decides prices, totals, discounts, or delivery fees. The backend recalculates everything from the database before any transaction.

5. **Transactional financial state** — All financial state changes (payment status, stock, coupon usage) are wrapped in `prisma.$transaction()`. Domain events are emitted **after** the transaction commits, never inside it.

6. **Domain events outside transactions** — `eventBus.emit()` is always called after `$transaction()` resolves, never inside the callback. `setImmediate()` is used where the emit is inside a callback but must fire post-commit.

7. **Database secrets** — All secrets live in `.env` (gitignored). The `DATABASE_URL`, `JWT_SECRET`, `AI_API_KEY`, and M-PESA credentials are never committed to git.

8. **Delivery fee single source of truth** — `StoreSettings.deliveryFeeKes` (default 350) and `StoreSettings.freeDeliveryThresholdKes` (default 10000) are the only source. Checkout, AI tool, and frontend all read from there.

---

## 3. Payment Architecture

### Website (C2B / Till)

```
Customer fills checkout form
          ↓
POST /api/orders
          ↓
CheckoutSession created (no Order, no stock)
          ↓
Returns: sessionRef + tillNumber + amount
          ↓
Customer: Lipa na M-PESA → Buy Goods → Till → Enter sessionRef
          ↓
Safaricom POST /api/orders/mpesa-c2b-callback
          ↓
Match by BillRefNumber = sessionRef
          ↓
BEGIN TRANSACTION
  → re-check stock
  → CREATE Order
  → DEDUCT stock (atomic RETURNING)
  → InventoryMovement type=SALE
  → claim coupon
  → upsert Customer
  → mark CheckoutSession PAID
  → link orderId
COMMIT
          ↓
GET /api/orders/checkout-session/:ref (3s poll from storefront)
          ↓
status = PAID → order confirmation
```

### POS (C2B / Till)

```
Cashier adds items to cart
          ↓
POST /api/pos/checkout
          ↓
Stock availability CHECK only (no deduction)
SalePayment ledger NOT written yet
PosSale created: saleStatus=OPEN, paymentStatus=PENDING/PAID
          ↓
CASH → completeSaleAtomically() called immediately
MPESA → cashier shows Till number + receipt ref to customer
          ↓
Customer: Lipa na M-PESA → Buy Goods → Till → Enter receipt #
          ↓
Safaricom POST /api/orders/mpesa-c2b-callback
          ↓
Match by BillRefNumber = receiptNumber (no phone+amount fallback)
          ↓
PosSale.paymentStatus = PAID
          ↓
PaymentNotification created (scoped to session)
          ↓
POS polls /pos/payment-notifications (3s, session-scoped)
          ↓
Cashier sees: "M-PESA received — KES X — receipt QGH8721X"
          ↓
Cashier clicks COMPLETE SALE
          ↓
POST /api/pos/sales/:id/complete
          ↓
completeSaleAtomically():
  BEGIN TRANSACTION
    updateMany WHERE saleStatus=OPEN (atomic, prevents double-complete)
    DEDUCT stock (RETURNING)
    InventoryMovement type=SALE
    SalePayment record (MPESA/CASH)
    AuditLog
  COMMIT
          ↓
Receipt printed → sale done
```

### Unmatched Payments

If `BillRefNumber` does not match any pending CheckoutSession or PosSale:
```
UnmatchedPayment created → Owner Panel → Manual review → Assign or Ignore
```

**Never** auto-match by phone+amount — two customers paying the same amount would be ambiguous.

### Payment State Machine (Order and PosSale)

```
PENDING
  ├── C2B confirmed  → PAID
  └── FAILED/EXPIRED → stock released (InventoryMovement type=RETURN)

PENDING_CORRELATION  (timeout during STK — ambiguous)
  ├── C2B callback arrives → PAID
  └── expire-pending job  → FAILED + stock released

PAID   → no manual transitions (use /payment-override with reason)
FAILED → no direct PAID (stock already restored; fresh order required)
```

---

## 4. POS Sale Completion Lifecycle

```
PosSale.saleStatus:
  OPEN        → just created, payment not yet confirmed
  COMPLETED   → payment confirmed + stock deducted + cashier confirmed
  CANCELLED   → cashier voided before completion
  EXPIRED     → payment window expired, stock not deducted

PosSale.paymentStatus:
  PENDING              → M-PESA awaiting
  PENDING_CORRELATION  → ambiguous timeout
  PAID                 → Safaricom confirmed
  FAILED               → rejected or expired
```

**Stock is ONLY deducted when `saleStatus` transitions from `OPEN` → `COMPLETED`.**

---

## 5. Database Schema — Key Models

| Model | Purpose |
|-------|---------|
| `Product` / `Variant` | Catalogue — prices stored as `DECIMAL(10,2)` |
| `Order` | E-commerce orders — created only after payment confirmation |
| `CheckoutSession` | Website payment intent — holds cart + customer before Order exists |
| `PosSale` | POS transactions — linked to `cashierId`, `sessionId`, `deviceId` |
| `SalePayment` | POS payment ledger — one record per payment component (MPESA, CASH) |
| `PaymentNotification` | Cashier alert — CHECK constraint: exactly one of `orderId`/`posSaleId` non-null |
| `UnmatchedPayment` | Unmatched C2B payments awaiting owner review |
| `InventoryMovement` | Full audit trail — types: `SALE`, `RETURN`, `ADJUSTMENT`, `RESERVATION` |
| `AuditLog` | Every sensitive operation — actor, action, details, IP |
| `PosSession` | Active cashier sessions — token stored as SHA-256 hash |
| `PosLoginRequest` | Owner approval flow — 2-minute TTL |
| `StoreSettings` | Single config record — delivery fee, WhatsApp, AI enabled |
| `Admin` | Owner and Cashier accounts — bcrypt passwords and PINs |
| `Customer` | Customer records — phone stored as E.164 (+254XXXXXXXXX) |
| `Coupon` | Promotional codes — usage claimed transactionally |

### Monetary Fields
All monetary fields use `DECIMAL(10,2)` — no floating-point drift.

### Migrations
```
prisma/migrations/
  20260907000000_baseline/
  20260911000000_transaction_integrity/
  20260912000000_payment_first_architecture/
```

Production deployment: `npx prisma migrate deploy`  
Development: `npm run db:migrate:dev`  
**Never** use `prisma db push` in production.

---

## 6. M-PESA Integration

### Current Architecture: C2B / Till (Buy Goods)
- Customers pay the Gem & Crystal Buy Goods Till number independently
- No STK Push prompt is sent to the customer's phone
- The system waits for Safaricom's real-time C2B callback
- `MPESA_TILL_NUMBER` configured in `.env`

### C2B Registration
```bash
POST /api/orders/mpesa-c2b-register   (OWNER only, run once per deployment)
```

### C2B Callback
```
POST /api/orders/mpesa-c2b-callback?token=<secret>
```
Validates: callback secret, payload schema, BillRefNumber match, amount tolerance (±1 KES).

### Correlation Strategy
1. BillRefNumber → CheckoutSession.sessionRef (website)
2. BillRefNumber → PosSale.receiptNumber (POS)
3. No match → UnmatchedPayment → owner review

### Error Classification
- `TimeoutError` / `TypeError(fetch)` / HTTP 5xx → `PENDING_CORRELATION` (ambiguous)
- HTTP 4xx / explicit Safaricom rejection → `FAILED` + stock restored

### Status: Pre-Daraja-Sandbox
C2B architecture is complete in code. Requires:
1. Real Safaricom merchant account with C2B/Till provisioning
2. `POST /api/orders/mpesa-c2b-register` called once
3. End-to-end sandbox test with real STK/Till confirmation
4. Reconciliation job for `PENDING_CORRELATION` records

---

## 7. Gem AI (Bilingual Shopping Assistant)

- **Provider:** OpenRouter → MiniMax M3 (`minimax/minimax-m3`)
- **Endpoint:** `POST /api/ai/chat`
- **Languages:** English and Kiswahili (auto-detected)
- **Rate limit:** 20 requests / 5 min per IP
- **Tools (read-only):** `search_products`, `get_product`, `get_store_info`, `get_delivery_info`
- **Guardrails:** System prompt blocks prompt injection, database access, admin operations, price invention
- **API key:** Backend only — never in frontend environment variables

### Delivery Info Source of Truth
The `get_delivery_info` tool reads `StoreSettings.deliveryFeeKes` and `freeDeliveryThresholdKes` — same values used by checkout. One source.

---

## 8. Authentication & Security

### Admin (JWT)
- JWT signed with `JWT_SECRET`, issuer `gem-crystal-api`, audience `gem-crystal-admin`
- 12-hour lifetime
- Login: `POST /api/admin/login` — Zod validated, constant-time bcrypt
- Logout: `POST /api/admin/logout` (client-side discard; server-side revocation planned Phase 5)
- Rate limited: 10 attempts / 15 min per IP

### POS (Session Tokens)
- PIN: digits-only Zod regex `/^\d{4,12}$/`, bcrypt-hashed
- PIN rate limit: 5 failures / 5 min per IP
- Owner real-time approval required (`PosLoginRequest` → `PosSession`)
- Session token: HMAC-SHA256, stored as SHA-256 hash — never plaintext
- Explicit logout: `POST /api/pos/logout` → immediately ends session in DB

### Payment Notifications
- Scoped to `PosSession.id` — only the session that created the sale receives its notification
- Two-step acknowledgement: `GET` (no ack) → display → `POST .../acknowledge`

---

## 9. Owner Admin Panel

### Navigation Tabs
| Tab | Component | Data Source |
|-----|-----------|-------------|
| Overview & KPIs | `Overview.tsx` | `/admin/stats` (polls 10s) |
| POS Monitoring | `PosMonitoring.tsx` | `/pos/sales`, `/pos/sessions` (polls 3s) |
| Product Catalog | `ProductsManager.tsx` | `/products` |
| Customer Orders | `OrdersManager.tsx` | `/orders` (polls 5s, paginated) |
| Inventory Control | `InventoryManager.tsx` | `/products` (variant stock) |
| Promos & Coupons | `CouponsManager.tsx` | `/coupons` |
| Unmatched Payments | `UnmatchedPaymentsManager.tsx` | `/orders/unmatched-payments` |
| Audit Trail | `AuditLogManager.tsx` | `/pos/audit-logs` (paginated, category filters) |
| Hardware & Settings | `HardwareDevicesManager.tsx` | `/pos/hardware`, `/settings` |

### Revenue Model
Revenue = `saleStatus=COMPLETED` POS sales + `paymentStatus=PAID` ecommerce orders.  
"Completed" is only reached after the cashier explicitly confirms the sale — not on payment confirmation alone.

### Analytics (Overview)
- Sales-by-day bar chart (last 14 days, combined channels)
- Fast-moving products (top 5 by units, last 30 days)
- Slow-moving products (bottom 5 by units, last 30 days)
- Low-stock alerts (≤5 units)

---

## 10. Inventory Rules

| Event | Stock Effect | InventoryMovement type |
|-------|-------------|------------------------|
| POS CASH checkout | Reserved (check only) → DEDUCTED at complete-sale | `SALE` |
| POS MPESA checkout | Reserved (check only) → DEDUCTED at complete-sale after confirmation | `SALE` |
| E-commerce checkout | None until payment | — |
| C2B callback (website) | DEDUCTED atomically inside callback transaction | `SALE` |
| Payment FAILED/EXPIRED | Restored | `RETURN` |
| Manual adjustment | Atomic SQL conditional, requires reason | `ADJUSTMENT` |
| Owner payment override to FAILED | Restored | `RETURN` |

---

## 11. Receipt & eTIMS

### Current State
The POS receipt shows:
- Correct payment method (M-PESA / Cash)
- Real M-PESA receipt number when confirmed
- VAT calculation (16% inclusive)
- Honest notice: *"Electronic Tax Invoice integration pending KRA eTIMS onboarding."*

### eTIMS Integration — Pending
Requires:
1. KRA eTIMS onboarding with actual business credentials
2. Middleware serial numbers (`M/w-No.`, `M/w-SN.`)
3. Sequential invoice numbering
4. QR code containing verifiable invoice payload
5. Physical 80mm printer test

**Do not claim eTIMS compliance until all of the above are verified.**

---

## 12. WhatsApp Integration

### Current State
- WhatsApp contact link: `wa.me/254718796296` (from `StoreSettings.whatsappNumber`)
- Link appears on storefront and in Gem AI escalation responses

### Planned Integration (Phase 2)
```
OrderPaid / SaleCreated events
         ↓
EventBus listener
         ↓
WhatsApp service
         ↓
Meta WhatsApp Cloud API / Twilio
         ↓
Customer confirmation message
```
Owner notification for new orders is also planned.

---

## 13. Event Bus

All domain events are emitted **after** `$transaction()` commits.

| Event | Emitted From | Current Action |
|-------|-------------|----------------|
| `OrderCreated` | orders.ts checkout | Log |
| `OrderPaid` | orders.ts C2B callback | Log (Phase 2: WhatsApp) |
| `SaleCreated` | pos.ts CASH complete / MPESA callback | Log (Phase 2: WhatsApp) |
| `PaymentFailed` | callback failure | Log |
| `InventoryAdjusted` | products.ts manual adjust | Log |

---

## 14. Production Readiness Checklist

### Before Daraja Sandbox
- [x] CheckoutSession / payment-first architecture
- [x] C2B callback with BillRefNumber matching
- [x] UnmatchedPayment model + owner review UI
- [x] SalePayment ledger
- [x] completeSaleAtomically() — stock deducted after confirmation
- [x] Payment state machine enforced
- [x] Payment expiry (paymentExpiresAt, expire-pending endpoint)
- [x] Decimal monetary fields
- [x] Prisma migrations (3 tracked)

### Before Physical Shop Test
- [ ] Daraja C2B sandbox test — real STK/Till flow
- [ ] `POST /api/orders/mpesa-c2b-register` called with real credentials
- [ ] Physical 80mm receipt printer test
- [ ] Barcode scanner test
- [ ] Cash drawer test
- [ ] Cashier PIN set (non-default)
- [ ] `MPESA_TILL_NUMBER` configured in production `.env`

### Before Production Deployment
- [ ] WhatsApp business integration (Meta/Twilio)
- [ ] eTIMS onboarding with KRA
- [ ] Automated integration tests
- [ ] PostgreSQL production instance with backups
- [ ] Domains + HTTPS + CORS configured
- [ ] Cloudinary configured for product images
- [ ] All `.env.example` values filled in production `.env`
- [ ] `npm run db:migrate:deploy` run on production DB

---

## 15. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Admin JWT signing secret |
| `POS_SESSION_SECRET` | ✅ | POS session token derivation |
| `STOREFRONT_URL` | Production | CORS origin for storefront |
| `ADMIN_URL` | Production | CORS origin for admin panel |
| `POS_URL` | Production | CORS origin for POS terminal |
| `MPESA_ENV` | M-PESA | `sandbox` or `production` |
| `MPESA_CONSUMER_KEY` | M-PESA | Daraja API consumer key |
| `MPESA_CONSUMER_SECRET` | M-PESA | Daraja API consumer secret |
| `MPESA_SHORTCODE` | M-PESA | Business short code |
| `MPESA_PASSKEY` | M-PESA | STK passkey (legacy, may be unused for C2B) |
| `MPESA_CALLBACK_URL` | M-PESA | Public HTTPS URL for C2B callbacks |
| `MPESA_CALLBACK_SECRET` | M-PESA | High-entropy secret bound to this installation |
| `MPESA_TILL_NUMBER` | M-PESA | Physical Buy Goods Till number shown to customers |
| `AI_PROVIDER` | AI | `openrouter` |
| `AI_API_KEY` | AI | OpenRouter API key (backend only) |
| `AI_MODEL` | AI | `minimax/minimax-m3` |
| `CLOUDINARY_CLOUD_NAME` | Uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Uploads | Cloudinary API secret |

---

## 16. Delivery Configuration

| Setting | Default | Source |
|---------|---------|--------|
| Delivery fee | KES 350 | `StoreSettings.deliveryFeeKes` |
| Free delivery threshold | KES 10,000 | `StoreSettings.freeDeliveryThresholdKes` |
| Coverage | Kenya nationwide | `StoreSettings.deliveryFeeDisclaimer` |

All three applications (checkout, AI, storefront) read from `StoreSettings`. Changing the fee in the Admin panel updates all channels simultaneously.

---

## 17. Kenya Counties

All 47 Kenya counties are available in the checkout county selector. The complete list is hardcoded in `CheckoutModal.tsx` and validated by the backend `CustomerSchema`.

---

*This document supersedes all previous versions of the Master Specification.*  
*Updated to reflect the current state of all four repositories as of 2026-09-13.*
