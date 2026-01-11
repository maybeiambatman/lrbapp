# Golf Trip Manager - Backend API

Production-ready backend service for the Golf Trip Manager application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma (with migrations)
- **Language**: TypeScript

## Quick Start

### Dev Container Setup

This project uses VS Code Dev Containers with all dependencies pre-installed. PostgreSQL runs in a separate container accessible at \`postgres:5432\`.

### Local Development

1. **Run database migrations**:
   ```bash
   npx prisma migrate dev --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```

2. **Seed database** (optional but recommended):
   ```bash
   npm run db:seed
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

Server runs at http://localhost:3001

### View Database

**Prisma Studio** (visual database browser):
```bash
npx prisma studio --port 5555
```
Opens at http://localhost:5555

## Database Management

### Migrations

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
```

### Seeding

Seed data for local development testing:

```bash
npm run db:seed
```

Seeds include:
- Admin user (admin@golf.com)
- Sample course (Augusta National with 18 holes)
- Sample trip (MSTR26) with 4 players
- Sample games (Best Ball, Match Play, Nassau)
- Sample teams and matches
- Sample community

### Prisma Studio

Visual database browser:

```bash
npx prisma studio --port 5555
```

Opens at http://localhost:5555

### Regenerate Prisma Client

If you modify the schema without creating a migration:

```bash
npm run db:generate
```

### SQLTools Extension (VS Code)

For direct SQL query access, use the SQLTools PostgreSQL extension.

**1. Create a new connection**:
- Open Command Palette (\`Cmd/Ctrl + Shift + P\`)
- Select: \`SQLTools: Add New Connection\`
- Choose: \`PostgreSQL\`

**2. Configure connection**:
```
Connection name: LRB App (Dev)
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
- Select query text and run with \`Cmd/Ctrl + E + E\`

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

## API Endpoints

### Trips

- \`GET /api/trips\` - Get all trips
- \`GET /api/trips/:id\` - Get trip by ID
- \`GET /api/trips/code/:code\` - Get trip by code
- \`POST /api/trips\` - Create trip
- \`PUT /api/trips/:id\` - Update trip
- \`DELETE /api/trips/:id\` - Delete trip
- \`POST /api/trips/:id/players\` - Add player to trip

### Courses

- \`GET /api/courses\` - Get all courses
- \`GET /api/courses/:id\` - Get course by ID
- \`POST /api/courses\` - Create course
- \`PUT /api/courses/:id\` - Update course
- \`DELETE /api/courses/:id\` - Delete course

### Scores

- \`GET /api/scores/trip/:tripId?round=X\` - Get trip scores
- \`GET /api/scores/player/:playerId\` - Get player scores
- \`POST /api/scores\` - Create/update score
- \`DELETE /api/scores/:id\` - Delete score

### Users

- \`GET /api/users\` - Get all users
- \`GET /api/users/email/:email\` - Get user by email
- \`POST /api/users\` - Create user
### Games

- `GET /api/games` - Get all games (filter by tripId, roundNumber, format, isActive)
- `GET /api/games/:id` - Get game by ID
- `GET /api/games/:id/leaderboard` - Get game standings and leaderboard
- `POST /api/games` - Create game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

**Game Formats**: BEST_BALL, COMBINED_SCORE, HIGH_LOW, MONEYBALL, SKINS, NASSAU, SCRAMBLE  
**Play Types**: MATCH_PLAY, STROKE_PLAY  
**Scoring Types**: GROSS, NET, BOTH

### Matches

- `GET /api/matches` - Get all matches (filter by gameId, roundNumber, status, isTeamMatch)
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match scores and status
- `POST /api/matches/:id/complete` - Complete match and determine winner
- `DELETE /api/matches/:id` - Delete match

**Match Statuses**: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

### Teams

- `GET /api/teams` - Get all teams (filter by gameId)
- `GET /api/teams/:id` - Get team by ID with player details
- `GET /api/teams/:id/stats` - Get team statistics and match history
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Communities

- `GET /api/communities` - Get all communities (filter by isActive)
- `GET /api/communities/:id` - Get community by ID
- `POST /api/communities` - Create community
- `PUT /api/communities/:id` - Update community
- `DELETE /api/communities/:id` - Delete community
- `POST /api/communities/:id/members` - Add member to community
- `DELETE /api/communities/:id/members/:userId` - Remove member from community

## REST API Examples

See the `examples/rest/` directory for complete REST Client examples:

- `trips.rest` - Trip management examples
- `courses.rest` - Course management examples
- `scores.rest` - Score tracking examples
- `users.rest` - User management examples
- `games.rest` - Game setup and management examples
- `matches.rest` - Match tracking and results examples
- `teams.rest` - Team creation and statistics examples
- `communities.rest` - Community management examples

Open these files in VS Code with the REST Client extension installed to execute requests directly.

## Data Model

### Core Entities

- **User**: Application users (admins and players)
- **Course**: Golf courses with holes and tees
- **Trip**: Golf trips with players, rounds, and prizes
- **TripPlayer**: Players participating in a trip
- **RoundScore**: Score tracking for each player's round (with status)
- **HoleScore**: Individual hole scores

### Game System

- **Game**: Competition format (Best Ball, Nassau, Match Play, etc.)
- **Match**: Individual competition within a game (team or individual)
- **Team**: Player teams for team-based formats
- **Community**: Recurring golf groups across multiple trips

### Round Status

Rounds can be: `NOT_STARTED`, `STARTED`, `FINISHED`, `ABANDONED`

### Game Formats

- **BEST_BALL**: Team format where best score on each hole counts
- **COMBINED_SCORE**: Team scores are added together
- **HIGH_LOW**: One high, one low score counts
- **MONEYBALL**: Rotating player whose score counts double
- **SKINS**: Winner takes all for each hole
- **NASSAU**: Three bets (front 9, back 9, overall)
- **SCRAMBLE**: Best ball position, all play from there

## Project Structure

```python
backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── trips.ts
│   │   ├── courses.ts
│   │   ├── scores.ts
│   │   ├── users.ts
│   │   ├── games.ts     # Game management
│   │   ├── matches.ts   # Match tracking
│   │   ├── teams.ts     # Team management
│   │   └── communities.ts
│   ├── services/        # Business logic (future)
│   ├── middleware/      # Express middleware
│   ├── utils/           # Shared utilities
│   └── server.ts        # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Version-controlled migrations
│   └── seed.ts          # Test data seeder
├── examples/
│   └── rest/            # REST Client API examples
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
docker run -p 3001:3001 \\
  -e DATABASE_URL="postgresql://..." \\
  lrbapp-backend
```

### Environment Variables

Required:
- \`DATABASE_URL\` - PostgreSQL connection string
- \`PORT\` - Server port (default: 3001)

Optional:
- \`NODE_ENV\` - Environment (development/production)
- \`ALLOWED_ORIGINS\` - CORS origins (comma-separated)

## Schema Evolution

When updating the database schema:

1. **Modify** \`prisma/schema.prisma\`
2. **Create migration**: 
   ```bash
   npx prisma migrate dev --name descriptive_name --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```
3. **Name it descriptively**: e.g., "add_ctp_tracking"
4. **Test locally** with seed data: \`npm run db:seed\`
5. **Commit** migration files to Git
6. **Deploy** with:
   ```bash
   npx prisma migrate deploy --url "postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public"
   ```

Prisma tracks migration history to ensure backwards compatibility.

## Troubleshooting

### Database connection issues
- PostgreSQL runs in the \`postgres\` container (not \`localhost\`)
- Connection string: \`postgresql://postgres:postgres@postgres:5432/lrbapp?schema=public\`
- Verify containers are running: \`docker ps\`

### Prisma Client out of sync
```bash
npm run db:generate
```

### Port already in use
```bash
lsof -ti:3001 | xargs kill -9
```

### View all running services
```bash
docker ps
```
