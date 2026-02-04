# LRBApp Documentation

Welcome to the Golf Trip Manager documentation. This app helps you manage golf trips with player rosters, tee times, live scoring, leaderboards, and prize purses.

## Quick Links

| I want to... | Go to |
|--------------|-------|
| Start developing locally | [Getting Started](getting-started.md) |
| Understand daily dev workflow | [Development Guide](development.md) |
| Deploy to GCP | [Deployment Guide](deployment/index.md) |
| Understand the database schema | [Architecture](architecture.md) |
| See API endpoints | [API Reference](api-reference.md) |
| Learn the Terraform setup | [Infrastructure](infrastructure.md) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              React + TypeScript + Vite + Tailwind           │
│                    (localhost:5173)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                               │
│              Express + Prisma + TypeScript                   │
│                    (localhost:3001)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL
┌─────────────────────▼───────────────────────────────────────┐
│                       PostgreSQL                             │
│                    (postgres:5432)                           │
└─────────────────────────────────────────────────────────────┘
```

**Monorepo Structure:**
- `backend/` - Express API with Prisma ORM
- `src/` - React frontend
- `terraform/` - GCP infrastructure as code
- `scripts/` - Deployment automation
- `docs/` - This documentation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Infrastructure | Terraform, GCP (Cloud Run, Cloud SQL) |
| Dev Environment | VS Code Dev Containers |

## Documentation Locations

This `/docs` folder contains the primary documentation. Module-specific READMEs provide quick references:

- [/README.md](../README.md) - Project overview and quick start
- [/backend/README.md](../backend/README.md) - Backend quick reference
- [/backend/ARCHITECTURE.md](../backend/ARCHITECTURE.md) - Database schema details
- [/terraform/README.md](../terraform/README.md) - Terraform quick reference
- [/scripts/README.md](../scripts/README.md) - Script quick reference

## Contributing

See [/.github/AGENT.md](../.github/AGENT.md) for development guidelines.
