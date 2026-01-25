# Backend API

Express.js REST API for the Golf Trip Manager.

📖 **Full documentation:** [/docs/](../docs/index.md) | [API Reference](../docs/api-reference.md)

## Quick Start

```bash
# Run migrations
npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"

# Seed database
npm run db:seed

# Start dev server (http://localhost:3001)
npm run dev
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js | REST API framework |
| Prisma | ORM with migrations |
| PostgreSQL 16 | Database |
| TypeScript | Type safety |

## Common Commands

```bash
# Database
npm run db:seed                    # Seed test data
npx prisma studio --port 5555      # Visual DB browser

# Migrations
npx prisma migrate dev --name NAME --url "..."   # Create migration
npx prisma migrate reset --force --url "..."     # Reset database (dev only!)

# Development
npm run dev                        # Start with hot reload
npm run build                      # Build for production
npm start                          # Run production build
```

## Seed Data

- Admin: `admin@golf.com`
- Trip code: `MSTR26`
- 4 players, Augusta National course
- Sample games, teams, community

## API Endpoints

See [API Reference](../docs/api-reference.md) for complete documentation.

**Key endpoints:**
- `GET /api/trips/code/:code` - Get trip by code
- `GET /api/courses` - List courses
- `POST /api/scores` - Submit scores
- `GET /api/games/:id/leaderboard` - Game standings

## Testing API

Use REST Client files in `examples/rest/`:
1. Open any `.rest` file
2. Click "Send Request" above each request

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed database design and entity relationships.

## Deployment

See [Deployment Guide](../docs/deployment/index.md) for GCP deployment.
