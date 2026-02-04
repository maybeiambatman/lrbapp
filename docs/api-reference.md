# API Reference

Complete REST API documentation for the Golf Trip Manager backend.

**Base URL:** `http://localhost:3001` (development) or your Cloud Run URL (production)

## Quick Test

```bash
# Health check
curl http://localhost:3001/health

# Get all trips
curl http://localhost:3001/api/trips

# Get trip by code
curl http://localhost:3001/api/trips/code/MSTR26
```

## Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get all trips |
| GET | `/api/trips/:id` | Get trip by ID |
| GET | `/api/trips/code/:code` | Get trip by code |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/players` | Add player to trip |

**Create Trip:**
```json
POST /api/trips
{
  "name": "Spring 2026",
  "code": "SPR26",
  "year": 2026,
  "startDate": "2026-04-01",
  "endDate": "2026-04-05",
  "buyIn": 100
}
```

## Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course by ID |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

## Scores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores/trip/:tripId` | Get trip scores (optional `?round=X`) |
| GET | `/api/scores/player/:playerId` | Get player scores |
| POST | `/api/scores` | Create/update score |
| DELETE | `/api/scores/:id` | Delete score |

## Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/email/:email` | Get user by email |
| POST | `/api/users` | Create user |

## Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Get all games (filter by tripId, roundNumber, format, isActive) |
| GET | `/api/games/:id` | Get game by ID |
| GET | `/api/games/:id/leaderboard` | Get game standings |
| POST | `/api/games` | Create game |
| PUT | `/api/games/:id` | Update game |
| DELETE | `/api/games/:id` | Delete game |

**Game Formats:** `BEST_BALL`, `COMBINED_SCORE`, `HIGH_LOW`, `MONEYBALL`, `SKINS`, `NASSAU`, `SCRAMBLE`

**Play Types:** `MATCH_PLAY`, `STROKE_PLAY`

**Scoring Types:** `GROSS`, `NET`, `BOTH`

## Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get all matches (filter by gameId, roundNumber, status, isTeamMatch) |
| GET | `/api/matches/:id` | Get match by ID |
| POST | `/api/matches` | Create match |
| PUT | `/api/matches/:id` | Update match scores and status |
| POST | `/api/matches/:id/complete` | Complete match and determine winner |
| DELETE | `/api/matches/:id` | Delete match |

**Match Statuses:** `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

## Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | Get all teams (filter by gameId) |
| GET | `/api/teams/:id` | Get team by ID with player details |
| GET | `/api/teams/:id/stats` | Get team statistics |
| POST | `/api/teams` | Create team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |

## Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities` | Get all communities (filter by isActive) |
| GET | `/api/communities/:id` | Get community by ID |
| POST | `/api/communities` | Create community |
| PUT | `/api/communities/:id` | Update community |
| DELETE | `/api/communities/:id` | Delete community |
| POST | `/api/communities/:id/members` | Add member |
| DELETE | `/api/communities/:id/members/:userId` | Remove member |

## Interactive Testing

Use the REST Client files in `backend/examples/rest/` for interactive API testing:

- `trips.rest` - Trip management
- `courses.rest` - Course management
- `scores.rest` - Score tracking
- `users.rest` - User management
- `games.rest` - Game setup
- `matches.rest` - Match tracking
- `teams.rest` - Team management
- `communities.rest` - Community management

**Usage:**
1. Open any `.rest` file in VS Code
2. Click "Send Request" above each request
3. View response in side panel

See [backend/examples/rest/README.md](../backend/examples/rest/README.md) for details.
