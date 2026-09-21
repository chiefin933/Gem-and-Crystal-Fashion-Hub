# Gem & Crystal Fashion Hub

Gem & Crystal is a pre-launch fashion-commerce system for the online shop and physical store. It has four applications that share one API and PostgreSQL database.

## Applications

| Application | Folder | Purpose | Local port |
| --- | --- | --- | --- |
| Storefront | `Gem & Crystal Fashion Hub` | Customer shopping and checkout | 5173 |
| API | `gem-crystal-api` | Authentication, products, inventory, orders, payments and POS services | 4000 |
| Admin | `gem-crystal-admin` | Owner dashboard, stock, orders, coupons and POS oversight | 5174 |
| POS | `gem-crystal-pos` | Physical-store cashier terminal | 5175 |

## Documentation

- [Documentation index](docs/README.md)
- [Product Requirements Document — Markdown](docs/PRD.md)
- [Technical Requirements Document — Markdown](docs/TRD.md)
- [Product Requirements Document — Word](docs/Gem-Crystal-Platform-PRD.docx)
- [Technical Requirements Document — Word](docs/Gem-Crystal-Platform-TRD.docx)
- [M-Pesa configuration template](../gem-crystal-api/.env.example)

The requirements documents describe the complete product: catalogue, inventory, website checkout, admin, POS, security, deployment and M-Pesa payment confirmation.

## Local development

Open one terminal per application:

```bash
# API
cd ../gem-crystal-api
npm run dev

# Storefront
cd "../Gem & Crystal Fashion Hub"
npm run dev

# Admin
cd ../gem-crystal-admin
npm run dev

# Physical-store POS
cd ../gem-crystal-pos
npm run dev
```

Before starting the API for the first time, configure its `.env`, then apply the database schema and demo seed data:

```bash
cd ../gem-crystal-api
npm run db:migrate:deploy
npm run db:seed:dev
```

## M-Pesa payment safety

The system does not accept a manually entered M-Pesa receipt as payment proof. The backend must receive and verify the Safaricom callback before an order or POS sale becomes paid. A confirmed payment is then sent to the authenticated POS as a popup.

To enable real payments, configure the Daraja variables in `gem-crystal-api/.env` using `.env.example` as the template. Keep real keys in your deployment secret manager and use a public HTTPS callback address.

## Database backups

Daily local backups are configured through the operating-system scheduler. From `gem-crystal-api`, run `npm run db:backup` for a new snapshot and `npm run db:backup:status` to verify freshness. See [backup and recovery instructions](../gem-crystal-api/docs/DATABASE_BACKUPS.md). An off-device copy is required for disk-loss protection.

## Pre-launch checklist

- Replace all demo credentials and seed data.
- Configure production URLs, CORS origins and secret values.
- Test M-Pesa sandbox success, cancellation, callback retry and POS reconnect flows.
- Build each application with `npm run build`.
- Back up the production database before migration or deployment.

## License

Private pre-launch project. Do not distribute credentials or production configuration.
