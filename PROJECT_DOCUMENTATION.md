# Gem & Crystal Fashion Hub — Master System Specification & Architectural Reference

**Last Updated:** 2026-10-08
**Database Engine:** PostgreSQL (`gem_crystal_db`) via Prisma ORM  
**Database Connection:** Configured via `DATABASE_URL` environment variable in `.env` (managed via deployment secrets and excluded via `.gitignore`)  
**Architecture Pattern:** Domain-Driven Modular Monolith with Event Bus

---

## Storefront update October 2026

The storefront now uses the original black/pink retail design, responsive merchandise grids, explicit variant selection, wishlist and accessible shopping dialogs. Products load only from the live API; demo fallback and unused fake authentication have been removed. Official categories and store configuration remain separate from product availability.

The top campaign showcases women's clothing, men's clothing, sneakers and new arrivals through four automatically advancing slides with explicit pause/play. Pointer hover does not interrupt ordinary playback. Photos fill their frames without stretching, with subject-aware cropping. Promotional photography does not guarantee inventory. The bold brand slogan remains visible on phones. Circular WhatsApp/Gem AI controls stay fixed at the bottom and hide while dialogs are open. The phone assistant is a compact inset conversation panel, not a fullscreen sheet. The footer displays the fixed copyright year 2023.

Requirements and implementation contracts are maintained in docs/PRD.md and docs/TRD.md, with sharing copies in Word. Future changes must update these documents and the relevant verification notes before delivery. Production payment acceptance and the reported POS M-Pesa popup remain unverified; no frontend change marks an unverified payment paid.

## 1. Executive Summary & Brand Identity

**Gem & Crystal Fashion Hub** is a luxury fashion boutique and point-of-sale (POS) retail system engineered for the Kenyan fashion market. Operating both a digital e-commerce storefront and a physical boutique hub located in **Roysambu, Nairobi, Kenya**, Gem & Crystal specializes in 12 official fashion categories.

### Official 12 Product Categories

| # | Category | Department | Description |
|---|----------|------------|-------------|
| 1 | **Dresses** | Women Only | Evening gowns, cocktail dresses, silk slips, maxi dresses |
| 2 | **Two piece (skirt/trouser)** | Women Only | Coordinated crop top with matching skirt or wide-leg trouser sets |
| 3 | **Three piece** | Women Only | Luxury 3-piece tailored suit sets, vest, blazer & trouser combinations |
| 4 | **Straight jeans** | Women & Men | Vintage wash and dark indigo straight-leg denim jeans |
| 5 | **Mommy jeans** | Women Only | High-waisted vintage mom jeans with flattering contour fit |
| 6 | **Hoodies** | Women & Men (Unisex) | Heavyweight fleece streetwear hoodies and oversized pullovers |
| 7 | **Leather jackets** | Women & Men (Unisex) | Sleek vegan and genuine leather biker jackets |
| 8 | **Crop jackets** | Women & Men | Tailored cropped blazers, denim crop coats, and bomber jackets |
| 9 | **Trench coats** | Women & Men (Unisex) | Double-breasted long trench coats in camel, beige, and jet black |
| 10 | **Heels** | Women Only | Stiletto pumps, strappy sandals, block heels, and platform mules |
| 11 | **Sneakers** | Women & Men (Unisex) | Retro low-tops, platform trainers, and streetwear kicks |
| 12 | **Tote Bags** | Women Only | Structured leather tote bags, shoulder bags, and luxury handbags |

### Operational Core Specifications
- **Physical Hub Location**: Roysambu, Nairobi, Kenya.
- **Customer Delivery**: 24-hour nationwide delivery across Kenya (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret). Delivery fee is calculated and handled separately per order.
- **Payment Gateways**: Safaricom M-PESA Express STK Push & Credit/Debit Cards.
- **Official Support Contact**: `+254 718 796 296`
- **Official WhatsApp**: `wa.me/254718796296`

---

## 2. Environments & Deployment Architecture

### 1. Local Development Environment
| Application Component | Environment URL / Host | Status |
|-----------------------|------------------------|--------|
| **Storefront App** | `http://localhost:5173` | Running |
| **Admin Control Panel** | `http://localhost:5174` | Running |
| **Tablet POS Terminal** | `http://localhost:5175` | Running |
| **Central Express API** | `http://localhost:4000` | Running |
| **PostgreSQL Database** | Local `gem_crystal_db` (Port 5432) | Active |

### 2. Target Production Environment
| Service Component | Target Production Infrastructure |
|-------------------|-----------------------------------|
| **E-Commerce Storefront** | Custom SSL Domain (`gemcrystalfashion.co.ke`) |
| **Admin Control Panel** | Restricted Admin Domain (`admin.gemcrystalfashion.co.ke`) |
| **POS Terminal** | Dedicated Store Tablet / In-Store Network Endpoint |
| **Central API Server** | Cloud Node.js Production Instance with HTTPS |
| **PostgreSQL Database** | Managed Production PostgreSQL Database Server |
| **Media Asset Storage** | Cloudinary CDN Production Account |
| **WhatsApp Messaging** | Official Meta WhatsApp Business API Gateway |
| **M-PESA Gateways** | Safaricom Daraja Production Paybill/Till Credentials |

---

## 3. Domain Event Catalogue (`EventBus.ts`)

The system uses a domain-event taxonomy organized into logical subdomains:

```text
AUTHENTICATION
├── POSLoginRequested
├── POSLoginApproved
├── POSLoginDenied
└── POSSessionStarted

ORDERS
├── OrderCreated
├── OrderPaid
├── OrderCancelled
└── OrderCompleted

PAYMENTS
├── PaymentInitiated
├── PaymentConfirmed
├── PaymentFailed
└── PaymentRefunded

INVENTORY
├── InventoryReserved
├── InventoryDeducted
├── InventoryRestored
└── InventoryAdjusted

SALES
├── SaleCreated
└── SaleReturned

CUSTOMERS
├── CustomerCreated
└── CustomerUpdated

NOTIFICATIONS
├── WhatsAppNotificationRequested
└── NotificationFailed

RECEIPTS
└── ReceiptGenerated

AUDIT
└── AuditRecorded
```

---

## 4. Financial Transactions vs Asynchronous Work Flow

Payment processing follows a strict distinction between **synchronous transactional financial operations** and **asynchronous downstream events**:

```text
Safaricom M-Pesa Callback / POS Payment
                  │
                  ▼
         Validate Callback Payload
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
Synchronous Transactional  Synchronous Failure
PostgreSQL Operation       Response (Audit Logged)
  - Verify Idempotency
  - Deduct Variant Stock
  - Set Payment = PAID
  - Set Order = PAID
  - Commit DB Transaction
                  │
                  ▼
         Emit OrderPaid Event
                  │
       ┌──────────┼──────────┬──────────┐
       ▼          ▼          ▼          ▼
   WhatsApp    Receipt    Analytics   Audit Log
   Feedback   Generation   Update     Recording
    (Async)    (Async)     (Async)     (Async)
```

- **Financial State Change**: Transactional and synchronous. Stock deduction and payment state mutation are executed atomically within PostgreSQL (`prisma.$transaction`).
- **Downstream Work**: Asynchronous. External API calls (WhatsApp, analytics, thermal rendering) do not block or revert the financial state change if a network delay occurs.

---

## 5. Concurrency Control & Atomic Stock Deduction

To prevent race conditions when an online customer and a physical POS cashier buy the last item at the exact same moment:

### Atomic Reservation Query Logic
```sql
UPDATE "ProductVariant"
SET "stockQuantity" = "stockQuantity" - $requestedQuantity
WHERE "id" = $variantId
  AND "stockQuantity" >= $requestedQuantity;
```

If the updated row count is `0`, the system aborts the transaction and returns a standardized error payload:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "Item is currently out of stock!"
  }
}
```

---

## 6. eTIMS & KRA Tax Compliance Specification

### Compliance Requirements
1. **VAT Tax Rate**: Standard 16% Kenya Value Added Tax included in gross prices (`VAT Amount = Gross * 0.16 / 1.16`).
2. **Invoice Numbering**: Sequential invoice sequence (`Tax Inv No: GC-POS-XXXX`).
3. **eTIMS QR Code**: Scannable 2D QR Code SVG rendered on every physical and digital receipt slip containing:
   - KRA Middleware Number: `M/w-No.:0020104080000762073`
   - KRA Serial Number: `M/w-SN.:KRAMW002202111010408`
4. **Fiscalization Audit Log**: Every tax-compliant transaction records VAT breakdown, Total Excl VAT, and KRA serial identifiers.

---

## 7. Roles & System Identity Authorization Matrix

Authorization distinguishes between **Human User Roles** and **System/Service Identities**:

### 1. Human Roles
- **OWNER**: Full administrative access across all 3 applications, catalog management, remote POS authorization, financial reports, and audit logs.
- **CASHIER**: Access restricted to POS terminal checkout, barcode scanning, cart management, and customer lookup.
- **CUSTOMER**: Public storefront access for browsing, cart management, and web checkout.

### 2. System Identities
- **MPESA_CALLBACK**: External Safaricom gateway service identity authorized strictly to submit payment status payloads to `/api/orders/mpesa-callback`.
- **WHATSAPP_SERVICE**: Automated background worker identity for customer return feedback messaging.
- **SYSTEM**: Internal backend event bus execution context.

---

## 8. Single-Slip ESC/POS 80mm Thermal Receipt Engine & Test Suite

### Layout & Print Specification
Designed to produce a single 80mm receipt document per print invocation, with CSS page-break suppression (`@page { size: 80mm auto; margin: 0; }` and `page-break-after: avoid;`) and printer configuration validated against target thermal printers (Epson, Sunmi, Xprinter, Bixolon).

### Hardware Receipt Definition-of-Done Test Suite
- [ ] Receipt prints cleanly on target 80mm thermal printer.
- [ ] One print command produces exactly one physical receipt slip.
- [ ] No duplicate pages or secondary blank feed cuts.
- [ ] Content fits 80mm roll width without horizontal clipping.
- [ ] Embedded eTIMS QR code is scannable by smartphone camera.
- [ ] Text typography is legible under thermal print resolution.
- [ ] Receipt footer explicitly prints `"Thank you for shopping with us Gem & Crystal Fashion Hub"`.

---

## 9. Specification & Verification Matrix

The status of system capabilities is tracked across four distinct audit stages:
- **Specified**: Architectural requirement documented in master specification.
- **Implemented**: Source code written and active in repository.
- **Tested**: Verified via automated or manual test suite.
- **Production Verified**: Validated on production infrastructure with live hardware/gateways.

| Feature Area | Specified | Implemented | Tested | Production Verified |
|--------------|:---------:|:-----------:|:------:|:-------------------:|
| **Database Secret Isolation (`DATABASE_URL`)** | ✅ | ✅ | ✅ | ⏳ Pending Deploy |
| **Domain Event Bus (`EventBus.ts`)** | ✅ | ✅ | ✅ | ⏳ Pending Deploy |
| **M-PESA Callback Idempotency Engine** | ✅ | ✅ | ✅ | ⏳ Sandbox Tested |
| **Atomic PostgreSQL Stock Deduction** | ✅ | ✅ | ✅ | ⏳ Pending Load Test |
| **Product Archiving (Soft Deletion)** | ✅ | ✅ | ✅ | ⏳ Pending Audit |
| **Remote POS Approval State Machine (`PosLoginRequest`)** | ✅ | ✅ | ✅ | ⏳ Pending Device Test |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ | 🟢 Verified in Code |
| **Centralized Error Payload Framework** | ✅ | ✅ | ✅ | ⏳ Pending Audit |
| **Customer WhatsApp Return Feedback** | ✅ | ✅ | ✅ | ⏳ Sandbox Tested |
| **Single-Slip 80mm Thermal Receipt** | ✅ | ✅ | ✅ | ⏳ Target Hardware Pending |
| **Bilingual Conversational AI Assistant** | ✅ | ✅ | ✅ | ⏳ Pending Live Prompt Test |
| **PostgreSQL Database (`gem_crystal_db`)** | ✅ | ✅ | ✅ | ⏳ Production DB Pending |

---

## 10. Central REST API Reference & Security Matrix

| Endpoint | Method | Authentication | Access Role / Identity | Purpose |
|----------|--------|----------------|------------------------|---------|
| `/api/health` | `GET` | None | Public | Health check & server status |
| `/api/settings` | `GET` | None | Public | Store settings & contact details |
| `/api/products` | `GET` | None | Public | Browse catalogue with search/category filters |
| `/api/products/:id` | `GET` | None | Public | Fetch single product by ID or slug |
| `/api/admin/login` | `POST` | None | Public | Merchant admin login (returns JWT) |
| `/api/admin/me` | `GET` | JWT Token | OWNER | Validate active admin session |
| `/api/products` | `POST` | JWT Token | OWNER | Create product with variants |
| `/api/products/:id` | `DELETE` | JWT Token | OWNER | Soft delete / archive product |
| `/api/upload/images` | `POST` | JWT Token | OWNER | Upload images to Cloudinary CDN |
| `/api/pos/auth-request` | `POST` | None | CASHIER | Submit cashier PIN/Fingerprint login request |
| `/api/pos/auth-status/:id` | `GET` | None | CASHIER | Poll authorization status for POS tablet |
| `/api/pos/pending-approvals` | `GET` | JWT Token | OWNER | Fetch pending cashier login requests |
| `/api/pos/approve-request` | `POST` | JWT Token | OWNER | Owner `[APPROVE]` or `[DENY]` decision |
| `/api/pos/checkout` | `POST` | POS Session | CASHIER | Atomic POS checkout with customer details |
| `/api/orders` | `POST` | None | CUSTOMER | Atomic storefront checkout & stock deduction |
| `/api/orders/mpesa-callback` | `POST` | Callback Token | MPESA_CALLBACK | Process Safaricom M-PESA STK callbacks |
| `/api/orders` | `GET` | JWT Token | OWNER | List customer e-commerce orders |
| `/api/pos/sales` | `GET` | JWT Token | OWNER | List in-store boutique sales log |
| `/api/pos/audit-logs` | `GET` | JWT Token | OWNER | List structured system audit logs |
