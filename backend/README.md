# Golf Trip Manager - Backend API

Production-ready backend service for the Golf Trip Manager application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma (with migrations)
- **Language**: TypeScript

## Quick Start

<<<<<<< HEAD
<<<<<<< HEAD
### Dev Container Setup

This project uses VS Code Dev Containers with all dependencies pre-installed. PostgreSQL runs in a separate container accessible at `postgres:5432`.

### Local Development

1. **Run database migrations**:
   ```bash
   npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```

2. **Seed database** (optional but recommended):
=======
### Prerequisites
=======
### Dev Container Setup
>>>>>>> b0ffcbb (Adding Prisma db for the backend)

This project uses VS Code Dev Containers with all dependencies pre-installed. PostgreSQL runs in a separate container accessible at `postgres:5432`.

### Local Development

1. **Run database migrations**:
   ```bash
   npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```

<<<<<<< HEAD
2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Start PostgreSQL** (if using Docker):
   ```bash
   docker run -d \
     -p 5432:5432 \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=lrbapp \
     postgres:16-alpine
   ```

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

5. **Seed database** (optional):
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
2. **Seed database** (optional but recommended):
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
   ```bash
   npm run db:seed
   ```

<<<<<<< HEAD
<<<<<<< HEAD
3. **Start dev server**:
=======
6. **Start dev server**:
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
3. **Start dev server**:
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
   ```bash
   npm run dev
   ```

Server runs at http://localhost:3001

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
### View Database

**Prisma Studio** (visual database browser):
```bash
npx prisma studio --port 5555 --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```
Opens at http://localhost:5555

<<<<<<< HEAD
=======
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
## Database Management

### Migrations

<<<<<<< HEAD
<<<<<<< HEAD
Prisma manages database schema evolution with migrations.

**Create and apply a new migration**:
```bash
npx prisma migrate dev --name descriptive_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

**Apply migrations (production)**:
```bash
npx prisma migrate deploy --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

**Check migration status**:
```bash
npx prisma migrate status --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

**Reset database** (dev only - destroys all data!):
```bash
npx prisma migrate reset --force --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
=======
Prisma manages database schema evolution with migrations:
=======
Prisma manages database schema evolution with migrations.
>>>>>>> b0ffcbb (Adding Prisma db for the backend)

**Create and apply a new migration**:
```bash
npx prisma migrate dev --name descriptive_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

**Apply migrations (production)**:
```bash
npx prisma migrate deploy --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

<<<<<<< HEAD
# Reset database (dev only - destroys data!)
npx prisma migrate reset
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
**Check migration status**:
```bash
npx prisma migrate status --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
```

**Reset database** (dev only - destroys all data!):
```bash
npx prisma migrate reset --force --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
```

### Seeding

Seed data for local development testing:

```bash
npm run db:seed
```

Seeds include:
- Admin user (admin@golf.com)
- Sample course (Augusta National)
- Sample trip with 4 players

### Prisma Studio

Visual database browser:

```bash
<<<<<<< HEAD
<<<<<<< HEAD
npx prisma studio --port 5555 --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
=======
npm run db:studio
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
npx prisma studio --port 5555 --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
```

Opens at http://localhost:5555

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
### Regenerate Prisma Client

If you modify the schema without creating a migration:

```bash
npm run db:generate
```

### SQLTools Extension (VS Code)

For direct SQL query access, use the SQLTools PostgreSQL extension.

**1. Create a new connection**:
- Open Command Palette (`Cmd/Ctrl + Shift + P`)
- Select: `SQLTools: Add New Connection`
- Choose: `PostgreSQL`

**2. Configure connection**:
```
Connection name: LRB App Backend (Dev)
Server: postgres
Port: 5432
Database: lrbapp
Username: postgres
Password: postgres
```

**3. Save and connect**:
- Click "Test Connection" to verify
- Click "Save Connection"
- In SQLTools sidebar, click the plug icon to connect

**4. Run queries**:
- Right-click connection → "New SQL File"
- Write your SQL queries
- Select query text and run with `Cmd/Ctrl + E + E`

**Example queries**:
```sql
-- View all trips
SELECT * FROM "Trip";

-- View players with their trips
SELECT tp.name, tp.handicap, t.name as trip_name
FROM "TripPlayer" tp
JOIN "Trip" t ON tp."tripId" = t.id;

-- View course holes
SELECT h.number, h.par, h.yards, h."handicapRank"
FROM "Hole" h
JOIN "Course" c ON h."courseId" = c.id
WHERE c.name = 'Augusta National Golf Club'
ORDER BY h.number;
```

**Note**: PostgreSQL requires double quotes for case-sensitive table/column names that Prisma generates.

<<<<<<< HEAD
=======
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
## API Endpoints

### Trips

- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `GET /api/trips/code/:code` - Get trip by code
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/players` - Add player to trip

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Scores

- `GET /api/scores/trip/:tripId?round=X` - Get trip scores
- `GET /api/scores/player/:playerId` - Get player scores
- `POST /api/scores` - Create/update score
- `DELETE /api/scores/:id` - Delete score

### Users

- `GET /api/users` - Get all users
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create user

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic (future)
│   ├── middleware/      # Express middleware
│   ├── utils/           # Shared utilities
│   └── server.ts        # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Version-controlled migrations
│   └── seed.ts          # Test data seeder
├── package.json
└── tsconfig.json
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t lrbapp-backend .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  lrbapp-backend
```

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)

Optional:
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)

## Schema Evolution

When updating the database schema:

1. **Modify** `prisma/schema.prisma`
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
2. **Create migration**: 
   ```bash
   npx prisma migrate dev --name descriptive_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```
<<<<<<< HEAD
3. **Name it descriptively**: e.g., "add_ctp_tracking"
4. **Test locally** with seed data: `npm run db:seed`
5. **Commit** migration files to Git
6. **Deploy** with:
   ```bash
   npx prisma migrate deploy --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```
=======
2. **Create migration**: `npm run db:migrate`
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
3. **Name it descriptively**: e.g., "add_ctp_tracking"
4. **Test locally** with seed data: `npm run db:seed`
5. **Commit** migration files to Git
<<<<<<< HEAD
6. **Deploy** with `npm run db:migrate:deploy`
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
6. **Deploy** with:
   ```bash
   npx prisma migrate deploy --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```
>>>>>>> b0ffcbb (Adding Prisma db for the backend)

Prisma tracks migration history to ensure backwards compatibility.

## Troubleshooting

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
### Database connection issues
- PostgreSQL runs in the `postgres` container (not `localhost`)
- Connection string: `postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public`
- Verify containers are running: `docker ps`

### Prisma Client out of sync
```bash
npm run db:generate
```

<<<<<<< HEAD
=======
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
### Port already in use
```bash
lsof -ti:3001 | xargs kill -9
```

<<<<<<< HEAD
<<<<<<< HEAD
### View all running services
```bash
docker ps
=======
### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb lrbapp`

### Prisma Client out of sync
```bash
npm run db:generate
>>>>>>> 408382c (Add production-ready backend with PostgreSQL and Prisma)
=======
### View all running services
```bash
docker ps
>>>>>>> b0ffcbb (Adding Prisma db for the backend)
```
