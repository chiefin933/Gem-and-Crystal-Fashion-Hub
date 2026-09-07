# GEM & CRYSTAL FASHION HUB — MASTER SYSTEM SPECIFICATION & VERIFICATION MATRIX

**Project:** Gem & Crystal Fashion Hub  
**Location:** Roysambu, Nairobi, Kenya  
**Business Type:** Fashion Boutique / Retail  
**Tagline:** **BE BOLD. BE BRIGHT. BE YOU.**  
**Database:** Central PostgreSQL Database (`gem_crystal_db`) via Prisma ORM  
**Architecture:** Domain-Driven Modular Monolith with Event Bus  
**Last Updated:** 2026-09-03  
**Status:** Official Master Specification & Production Blueprint  

---

# 1. Core Architectural Rules & Best Practices

1. **Database Secret Isolation**: Connection strings are managed via `DATABASE_URL` in `.env` (excluded via `.gitignore`), never hardcoded in source documentation.
2. **Domain-Event Taxonomy**: Event registry categorized into `AUTHENTICATION`, `ORDERS`, `PAYMENTS`, `INVENTORY`, `SALES`, `CUSTOMERS`, `NOTIFICATIONS`, `RECEIPTS`, and `AUDIT` domains.
3. **Synchronous Payment Transactions vs Asynchronous Work**: Financial state changes are synchronous and transactional in PostgreSQL (`prisma.$transaction`). Downstream tasks (WhatsApp notifications, receipts, analytics) execute asynchronously via event listeners.
4. **Atomic Concurrency Control**: Stock deductions use atomic `UPDATE ... WHERE "stockQuantity" >= $requestedQuantity` queries to eliminate race conditions between online and POS sales.
5. **Product Archiving Policy**: `DELETE /api/products/:id` marks `product.status = 'ARCHIVED'` to preserve historical sales records and eTIMS reports.
6. **eTIMS Compliance**: Standard 16% VAT breakdown, sequential invoice sequence (`GC-POS-XXXX`), and scannable 2D QR Code SVG containing KRA middleware and serial identifiers.
7. **Single-Slip Thermal Receipt Engine**: Designed to produce a single 80mm receipt document per print invocation, with CSS page-break suppression (`@page { size: 80mm auto; }`), closing with `"Thank you for shopping with us Gem & Crystal Fashion Hub"`.

---

# 2. Master Specification & Verification Matrix

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
