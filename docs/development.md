# Development Guide

Daily workflow, common tasks, and debugging tips.

## Daily Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
npm run dev -- --host

# Terminal 3 (optional): Database UI
cd backend && npx prisma studio --port 5555
```

### Stopping Services

Press `Ctrl+C` in each terminal. PostgreSQL runs automatically in the dev container.

## Database Tasks

### Reset Database

Wipe everything and re-seed:

```bash
cd backend
npx prisma migrate reset --force --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
npm run db:seed
```

### Create a New Migration

```bash
cd backend
# 1. Edit prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name your_migration_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

### Regenerate Prisma Client

If you modify the schema without migrating:

```bash
cd backend
npm run db:generate
```

### Check Migration Status

```bash
cd backend
npx prisma migrate status --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

## Testing the API

### Using REST Client (Recommended)

The `backend/examples/rest/` folder contains ready-to-use REST Client files:

1. Open any `.rest` file (e.g., `trips.rest`)
2. Click **"Send Request"** above each request
3. View response in the side panel

**Available files:**
- `trips.rest` - Trip management
- `courses.rest` - Course management
- `scores.rest` - Score entry
- `games.rest` - Game setup
- `teams.rest` - Team management
- `users.rest` - User management
- `communities.rest` - Community management

### Using curl

```bash
# Get all trips
curl http://localhost:3001/api/trips

# Get trip by code
curl http://localhost:3001/api/trips/code/MSTR26

# Create a trip
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -d '{"name": "Spring 2026", "code": "SPR26", "year": 2026}'
```

## Viewing Database

### Prisma Studio (Recommended)

Visual database browser:

```bash
cd backend
npx prisma studio --port 5555
```

### SQLTools Extension

For direct SQL queries:

1. Open SQLTools sidebar in VS Code
2. Create connection:
   - Server: `postgres`
   - Port: `5432`
   - Database: `lrbapp`
   - Username: `postgres`
   - Password: `postgres`
3. Right-click connection → New SQL File
4. Run queries with `Ctrl+E, E`

**Example queries:**
```sql
-- View all trips
SELECT * FROM "Trip";

-- View players with their trips
SELECT tp.name, tp.handicap, t.name as trip_name
FROM "TripPlayer" tp
JOIN "Trip" t ON tp."tripId" = t.id;
```

> **Note:** PostgreSQL requires double quotes for case-sensitive identifiers.

## Troubleshooting

### Port Already in Use

```bash
# Kill process on specific port
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5555 | xargs kill -9  # Prisma Studio
```

### Database Connection Issues

- PostgreSQL runs on `postgres:5432` (not `localhost`) in dev container
- Check container is running: `docker ps`
- Verify URL: `postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public`

### Prisma Client Out of Sync

If you get "table does not exist" errors after pulling new migrations:

```bash
cd backend
npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

### Hot Reload Not Working

For frontend, ensure you're using `--host`:
```bash
npm run dev -- --host
```

For backend, the dev server should auto-restart. If not, manually restart.

## Code Quality

### Linting

```bash
# Root (frontend)
npm run lint

# Backend
cd backend && npm run lint
```

### Type Checking

```bash
# Root (frontend)
npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

## Next Steps

- [Architecture](architecture.md) - Understand the database design
- [API Reference](api-reference.md) - Full endpoint documentation
- [Deployment](deployment/index.md) - Deploy to production
