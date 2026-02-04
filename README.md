# Golf Trip Manager

A full-stack web application for managing golf trips with player rosters, tee times, live scoring, leaderboards, and prize purses.

## Quick Start

This project uses **VS Code Dev Containers**. When you open it, VS Code will prompt you to "Reopen in Container".

**Start developing in 3 terminals:**

```bash
# Terminal 1: Backend API (http://localhost:3001)
cd backend && npm run dev

# Terminal 2: Frontend (http://localhost:5173)
npm run dev -- --host

# Terminal 3: Database UI (http://localhost:5555) - optional
cd backend && npx prisma studio --port 5555
```

**First time?** Run migrations and seed:
```bash
cd backend
npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
npm run db:seed
```

Test with trip code: `MSTR26`

## Documentation

📖 **Full documentation:** [docs/](docs/index.md)

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | First-time setup |
| [Development](docs/development.md) | Daily workflow |
| [Architecture](docs/architecture.md) | Database design |
| [API Reference](docs/api-reference.md) | REST endpoints |
| [Deployment](docs/deployment/index.md) | Deploy to GCP |

## Project Structure

```
├── backend/           # Express API + Prisma
├── src/               # React frontend
├── terraform/         # GCP infrastructure
├── scripts/           # Deployment automation
└── docs/              # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Infrastructure | Terraform, GCP (Cloud Run, Cloud SQL) |

