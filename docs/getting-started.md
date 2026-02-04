# Getting Started

Get the Golf Trip Manager running locally in under 5 minutes.

## Prerequisites

**Using Dev Container (Recommended):** Everything is pre-installed. Just open in VS Code.

**Running locally (without container):** You'll need Node.js 20+, PostgreSQL 16, and npm.

## 1. Open in Dev Container

1. Open this project in VS Code
2. When prompted, click **"Reopen in Container"**
3. Wait for the container to build (~2 minutes first time)

The dev container automatically provides:
- Node.js 20
- PostgreSQL 16 (running on `postgres:5432`)
- gcloud CLI, Terraform, Docker (for deployment)
- All VS Code extensions

## 2. Initialize the Database

Run migrations and seed test data:

```bash
cd backend
npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
npm run db:seed
```

**Seed data includes:**
- Admin user: `admin@golf.com`
- Sample trip code: `MSTR26`
- 4 test players
- Augusta National course with 18 holes

## 3. Start the Servers

Open **3 terminals** in VS Code:

### Terminal 1: Backend API
```bash
cd backend
npm run dev
```
→ API at http://localhost:3001

### Terminal 2: Frontend
```bash
npm run dev -- --host
```
→ App at http://localhost:5173

### Terminal 3: Prisma Studio (Optional)
```bash
cd backend
npx prisma studio --port 5555
```
→ Database UI at http://localhost:5555

## 4. Verify It Works

1. Open http://localhost:5173 in your browser
2. Enter trip code `MSTR26` to see the sample trip
3. Check the API: `curl http://localhost:3001/api/trips`

## Services Overview

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:3001 | Express REST API |
| PostgreSQL | postgres:5432 | Database |
| Prisma Studio | http://localhost:5555 | Database GUI |

## Next Steps

- [Development Guide](development.md) - Daily workflow, testing, debugging
- [Architecture](architecture.md) - Understand the database schema
- [API Reference](api-reference.md) - Explore available endpoints
- [Deployment Guide](deployment/index.md) - Deploy to GCP
