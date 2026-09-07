# Product Requirements Document (PRD)

## Gem & Crystal Fashion Hub Platform

**Version:** 1.0 — pre-launch baseline  
**Date:** 4 September 2026  
**Scope:** Storefront, API, admin dashboard, POS, inventory and payments

## 1. Product summary

Gem & Crystal Fashion Hub is one fashion-commerce system for the customer website and physical shop. It includes product browsing, variant-level stock, online checkout, owner administration, cashier POS, and a shared API with PostgreSQL as the source of truth.

**Core principle:** Products, stock, orders and payments have one source of truth. A customer screen, cashier action, or manually typed receipt cannot mark an order as paid.

## 2. Product areas

| Area | Outcome | Primary application |
| --- | --- | --- |
| Storefront | Browse products, select variants, apply coupons and place orders. | Customer website |
| Catalogue & inventory | Correct prices and stock across web and shop channels. | API + Admin |
| Admin | Owner manages products, coupons, stock, orders and POS access. | Admin dashboard |
| POS | Cashier scans/selects items and completes in-store sales. | Dedicated POS |
| Payments | M-Pesa confirmations are verified by the backend and shown to POS. | API + POS |

## 3. Goals

- Give customers a smooth website shopping and checkout flow.
- Keep stock accurate for every product size and colour variant.
- Give the owner full control of catalogue, inventory, coupons, orders and POS access.
- Give cashiers a secure, simple physical-store payment process.
- Confirm M-Pesa payments through the backend only, then alert POS automatically.
- Stop duplicated payment alerts and prevent stock from going below zero.

## 4. Non-goals

- Storing customer card details.
- Treating a manually entered M-Pesa receipt as proof of payment.
- Replacing Safaricom merchant onboarding, settlement or Daraja account setup.

## 5. Users

| User | Need | Successful outcome |
| --- | --- | --- |
| Website customer | Discover fashion items and pay securely. | Order is created with correct items, total and payment status. |
| Counter customer | Pay at the shop with M-Pesa. | Receives a prompt and sale is confirmed only after provider response. |
| Cashier | Know when it is safe to hand over goods. | POS shows a verified payment popup. |
| Owner | Run the whole store from one place. | Admin dashboard shows accurate stock, orders, payments and POS activity. |

## 6. Functional requirements

### Storefront and catalogue

- Display active products with images, categories, price, optional sale price, variants and stock availability.
- Let customers select valid size/colour variants, add items to cart, apply valid coupons and checkout.
- Calculate final checkout price, coupon discount and delivery fee on the API, not in the browser.

### Inventory

- Track stock per variant.
- Block orders and sales when stock is insufficient.
- Record every sale, return, failed-payment restoration and manual adjustment as an inventory movement.
- Update stock atomically so simultaneous web/POS sales cannot oversell.

### Admin and POS access

- Owner accounts manage products, inventory, coupons, store settings and orders.
- Only owner accounts can approve or reject POS login requests.
- Cashier POS sessions must require approval, expire automatically and be locked when finished.

### M-Pesa payments

- Collect a valid M-Pesa phone number for M-Pesa orders and POS sales.
- Create a pending order/sale before requesting payment.
- Send STK payment requests only from the API after it calculates the true total.
- Verify provider callback request IDs, amount, payer phone, result code and receipt.
- Create one durable notification for each confirmed payment.
- Show the active POS a popup with payment reference, customer, amount and receipt.
- On cancellation/failure, mark the transaction failed and restore reserved stock exactly once.

## 7. Acceptance criteria

1. A web M-Pesa order stays pending until the backend receives a valid successful callback.
2. A physical POS M-Pesa sale sends a payment prompt and never asks the cashier to type a receipt code.
3. A valid confirmation produces one POS popup.
4. Wrong amount, phone, request ID or callback secret cannot mark a payment paid.
5. Provider callback retries do not create duplicate stock movements or POS alerts.
6. A disconnected POS receives unacknowledged payment alerts after reconnecting.
7. Inactive products cannot be sold online or through POS.
8. Unauthorised users cannot access owner administration functions.

## 8. Experience requirements

- Customer-facing payment text must explain that payment is confirmed only after the backend receives the provider response.
- The POS button should say **Send M-Pesa Prompt** before confirmation.
- The confirmation popup must be readable at a counter and need an explicit acknowledgement.
- When M-Pesa is not configured, the system must say so clearly and never claim that payment succeeded.

## 9. Success measures

| Measure | Launch target |
| --- | --- |
| Verified payment popup delivery | 99% or higher within 10 seconds of callback |
| Duplicate payment alerts | 0 |
| False paid statuses | 0 |
| Inventory oversells | 0 |
| Pending payments requiring manual review | Less than 1% after daily review |

## 10. Launch dependencies

- Safaricom Daraja credentials, approved merchant setup, shortcode and passkey.
- A public HTTPS callback address.
- Production database backup and migration plan.
- Production secrets, CORS origins and owner credentials.
- Staff training for POS login, pending payments and payment confirmation.
