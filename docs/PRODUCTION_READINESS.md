# Production readiness changes — 16 September 2026

These changes are implemented locally in the storefront, API, admin and POS repositories. They are not a production deployment or certification. Existing unrelated working-tree changes were preserved.

## Payment and inventory behavior

- C2B, STK confirmation and owner reconciliation serialize receipt ownership with a PostgreSQL transaction advisory lock. Previously consumed receipts cannot pay another checkout through these paths.
- Checkout settlement deducts inventory, claims coupon usage, creates the order and queues its payment notification in one transaction. A business failure rolls all settlement changes back to a savepoint and retains the received payment for owner review. Infrastructure failures return HTTP 503 instead of falsely acknowledging successful processing.
- Concurrent checkout attempts cannot oversell stock or exceed a coupon usage cap. POS completion requires a paid, open sale. Repeated completion and reservation expiry are idempotent.
- POS acknowledgement requires a completed sale. The terminal retains its alert on HTTP acknowledgement failure. Retrying an interrupted cash checkout completes the existing sale rather than returning an unfinished receipt.
- Owner order edits cannot overwrite provider receipts, fulfill unpaid orders or manually label an unverified M-PESA order paid. Use a verified incoming payment through Unmatched Payments.
- The callback checks the configured business shortcode as well as its secret. Configure MPESA_SHORTCODE to the actual merchant shortcode in the callback, which may differ from the displayed Till number. Verify this against the actual merchant account before launch.

## Buy Goods reconciliation is an operational requirement

Buy Goods does not provide the customer with a checkout-reference entry field. Amount-only matching was removed because it cannot identify a payer reliably. Incoming payments without an exact reference remain in Unmatched Payments.

The owner verifies the payer, receipt, amount and intended purchase, then assigns to POS_SALE using its receipt reference, or CHECKOUT_SESSION using the customer's GC-PAY reference. Website checkout assignment creates the order atomically. An expired/failed checkout may be recovered by the owner only if the verified payment matches and inventory/coupon constraints still permit fulfillment. Otherwise arrange and record a refund through the merchant's payment process; this app does not issue refunds automatically.

Staff must monitor the unmatched-payment queue during trading hours. The website and POS now explain this workflow. Fully automatic online checkout needs a separately verified reference-bearing payment flow, such as STK correlation; it is not claimed by this release.

## Checkout and AI

Checkout returns a private tracking token stored in browser sessionStorage. Polling requires that token, resumes after a same-tab refresh/reopen, and returns authoritative server order details. Requests do not overlap and have timeouts. Closing the tab or disabling browser storage can lose recovery access; the owner can still reconcile with the customer's reference. Legacy sessions created before the migration have no tracking hash and require owner support.

The AI assistant accepts longer assistant history while retaining limits on user input and total history. It validates tool arguments, limits tool rounds and calls, rejects incomplete answers, has bounded request timeouts, and returns unavailable when the settings lookup fails. Configuration is read at request time, after environment loading.

The OpenRouter provider remains supported. To enable Astra in staging, configure the server:

```dotenv
AI_PROVIDER=openai
AI_MODEL=gpt-6-astra
AI_MAX_TOKENS=4000
AI_API_KEY=<OpenAI project key from secret manager>
```

The OpenAI path uses Responses, low reasoning for GPT-6, no sampling parameters, stateless encrypted reasoning replay and paired function-call results. No live API key was changed and no paid model call was made. Evaluate English, Kiswahili and mixed-language answers against real catalogue fixtures, and measure latency and spend before enabling Astra publicly. See [official Astra migration guidance](https://developers.openai.com/api/docs/guides/latest-model).

## Database deployment

A fresh-database test found overlapping DDL in migrations 20260911000000 and 20260912000000. Their repeated column/table/index statements now tolerate the earlier baseline. Existing applied databases may have historical checksums from the original files: review migration status and rehearse on a database clone before deployment. Do not reset a live database or blindly mark failed migrations applied. A database already left partially migrated needs an operator-reviewed recovery based on its actual schema.

The new 20260916000000_checkout_tracking migration adds a nullable CheckoutSession.trackingTokenHash column. Back up the database, verify restoration, then apply migrations before deploying the API and storefront together:

```bash
# In gem-crystal-api, with the intended staging/production DATABASE_URL
npm ci
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npm run build
```

Build the storefront, admin and POS with their production API URLs. Keep the added column on rollback; do not drop checkout/payment data. Rolling back payment logic restores the old defects, so pause checkout and reconcile receipts if an operational rollback is needed.

## Verification and repeatable checks

- All four application builds passed. Storefront lint has no errors; pre-existing warnings remain. Quick View now mounts product-specific state without conditional React hooks.
- Six unit tests exercise history budgets, configuration, Astra tool pairing/reasoning replay, incomplete output, OpenRouter compatibility and exact money comparison.
- Fourteen PostgreSQL/HTTP integration tests cover duplicate callbacks, partial rollback, last-unit contention, receipt replay, coupon contention, unmatched payments, concurrent owner assignment, private tracking, expiry, wrong merchant, transient callback failure, POS completion/reconnect, repeated expiry and blocked payment-verification bypasses.
- All seven migrations applied successfully to an empty isolated PostgreSQL 16 database. Prisma reported no schema difference afterward.
- Browser verification on disposable data: create checkout, refresh, resume payment polling and display the server-confirmed order after a simulated callback. On 17 September, repeated Quick View open/close/reopen was verified without hook failures; the final storefront build passed.
- Backend CI repeats migration, build and test checks on a disposable PostgreSQL service. CI itself has not yet run on the remote repository.

Run unit checks with `npm test` in the API. Integration checks deliberately truncate fixture tables and refuse to run without an explicit localhost TEST_DATABASE_URL whose database name contains `tests`:

```bash
TEST_DATABASE_URL=postgresql://USER:PASSWORD@127.0.0.1:5432/gem_tests npm run test:integration
```

Apply migrations to that disposable database first. Never use a production database or a production-derived database containing customer records for this command.

## Remaining launch gates

1. Rehearse deployment/migration/rollback against a staging clone; verify environment secrets, HTTPS, allowed origins, callback registration and backups.
2. Complete genuine Safaricom sandbox/merchant acceptance checks: received callback shape and merchant shortcode, reference-free payment reconciliation, wrong amounts, retry/redelivery, late payments and refund handling. HTTP 503 preserves a retry signal; confirm provider retry policy and establish merchant-statement reconciliation for missed callbacks.
3. Run live Astra bilingual catalogue evaluations with account access, latency and spending limits. Mocked tests establish protocol behavior, not live model quality or account availability.
4. Exercise offline POS sync, terminal hardware, cashier handover and recovery on actual devices; monitor unpaid and unmatched queues, stock conflicts, callback failures and AI errors.
5. Seeded testimonials and the non-saving newsletter signup were removed on 17 September. Unverified card-payment, return-window and 24/7 support claims were replaced with factual contact/payment guidance. Business-approved policies and contact details still need final review.

No live database was migrated, external callback registered, credentials replaced or production service deployed during this work.

## Database backup follow-up — 17 September

A real application-database archive was created and restored into a separate local recovery database. Daily systemd backups are enabled and a service run succeeded. The two pending migrations also applied successfully to a second restored staging copy, with no schema drift. Archives are private and excluded from Git. See the [backup runbook](../../gem-crystal-api/docs/DATABASE_BACKUPS.md) for restore commands, schedule and limitations. An off-device encrypted backup destination is still needed for protection against computer or disk loss.
