# Development Workflow

Quick reference for starting all services during development.

## Start Everything

Run these commands in **3 separate terminals**:

### Terminal 1: Backend API
```bash
cd backend
npm run dev
```
- Runs at: http://localhost:3001
- Auto-restarts on code changes
- Logs all API requests

### Terminal 2: Frontend
```bash
npm run dev -- --host
```
- Runs at: http://localhost:5173
- Hot Module Replacement (HMR) enabled
- Auto-opens in browser

### Terminal 3: Prisma Studio (Optional)
```bash
cd backend
npx prisma studio --port 5555 --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```
- Runs at: http://localhost:5555
- Visual database browser
- Edit data directly

## Services Overview

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:3001 | Express REST API |
| PostgreSQL | postgres:5432 | Database (dev container) |
| Prisma Studio | http://localhost:5555 | Database GUI |

## First Time Setup

Only need to run once:

```bash
cd backend
npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
npm run db:seed
```

## Testing the API

Use the REST Client examples in `backend/examples/rest/`:
1. Open any `.rest` file
2. Click "Send Request" above each request
3. See [backend/examples/rest/README.md](backend/examples/rest/README.md) for details

## Common Tasks

### Reset Database
```bash
cd backend
npx prisma migrate reset --force --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
npm run db:seed
```

### Add New Migration
```bash
cd backend
# Edit prisma/schema.prisma first
npx prisma migrate dev --name your_migration_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

### View Database with SQL
Use SQLTools extension (already installed):
1. Open SQLTools sidebar
2. Create connection: postgres@postgres:5432/lrbapp
3. Run SQL queries directly

## Stopping Services

- Backend/Frontend: Press `Ctrl+C` in the terminal
- Prisma Studio: Press `Ctrl+C` in the terminal
- PostgreSQL: Runs automatically in dev container (no need to stop)

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5555 | xargs kill -9  # Prisma Studio
```

**Database connection issues:**
- PostgreSQL runs on `postgres:5432` (not `localhost`)
- Check container is running: `docker ps`
- Database URL: `postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public`
