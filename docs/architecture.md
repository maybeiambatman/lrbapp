# Architecture

System and database architecture for the Golf Trip Manager.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              React + TypeScript + Vite + Tailwind           │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                               │
│              Express + Prisma + TypeScript                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL
┌─────────────────────▼───────────────────────────────────────┐
│                       PostgreSQL                             │
└─────────────────────────────────────────────────────────────┘
```

**Production (GCP):**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Cloud Run  │────▶│  Cloud SQL  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ VPC Network │
                    └─────────────┘
```

## Database Design Principles

1. **No Redundant Storage** - All computed values (yardage totals, purse totals, match scores) are derived, not stored
2. **Round-Centric** - Rounds are the central entity, can be standalone or part of trips
3. **Proper Golf Modeling** - Yardage and handicap rank vary by tee box per hole
4. **TeeTime Grouping** - TeeTimes group multiple rounds played together (e.g., foursome)

## Entity Relationship Overview

```
Course
  └─ Hole (par only)
       └─ TeeHole (yards, handicapRank per tee)
  └─ Tee
       └─ TeeHole (junction table)

Trip
  ├─ TripPlayer (players in the trip)
  ├─ TeeTime[] (scheduled tee times)
  └─ Round[] (rounds played during trip)

Round (central entity)
  ├─ playerId (the player)
  ├─ teeTimeId (optional - groups with other rounds)
  ├─ tripId (optional - can be standalone)
  ├─ courseId
  └─ RoundScore[] (hole-by-hole scores)

Game (unified - handles all competition scenarios)
  ├─ rounds (many-to-many via GameRound)
  ├─ teams (Team[])
  ├─ status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  └─ prizes (Prize[])
```

## Key Entities

### Course Structure

| Entity | Purpose |
|--------|---------|
| Course | Golf course (name, location) |
| Hole | Individual hole (number, par) |
| Tee | Tee box (name, color, slope, rating) |
| TeeHole | Junction: yards and handicap rank per tee/hole |

**Normalization:** Yardage and handicap rank stored once in TeeHole. Tee total yardage is computed.

### Trip & Round Structure

| Entity | Purpose |
|--------|---------|
| Trip | Golf trip with code, dates, buy-in |
| TripPlayer | Player participation in a trip |
| TeeTime | Groups rounds played together |
| Round | Single player's round (central entity) |
| RoundScore | Hole-by-hole strokes and putts |

**Key decisions:**
- Each player gets their own Round record
- TeeTime references rounds, not player IDs
- Rounds can be standalone or part of trips
- Unique constraint on [teeTimeId, playerId]

### Game System

| Entity | Purpose |
|--------|---------|
| Game | Any competition (match play, best ball, etc.) |
| GameRound | Links games to rounds (many-to-many) |
| Team | Team within a game (even 1v1 uses single-player teams) |
| Prize | Prize for a game or round |

**Key decisions:**
- No separate Match model - Game handles all scenarios
- Game can span any combination of rounds
- purseTotal computed from buyInAmount × participants
- Scores computed from Round data

### Game Formats

| Format | Description |
|--------|-------------|
| BEST_BALL | Best score from team on each hole |
| COMBINED_SCORE | Total of all team member scores |
| HIGH_LOW | Best + worst score from team |
| SKINS | Hole-by-hole winner takes pot |
| NASSAU | Three separate bets (front, back, total) |
| SCRAMBLE | Team plays from best shot |
| MONEYBALL | Special scoring ball |

## Computed Fields

These values are calculated on-the-fly, not stored:

```typescript
// Tee total yardage
tee.totalYardage = tee.holes.reduce((sum, hole) => sum + hole.yards, 0)

// Game purse total
purseTotal = game.buyInAmount * numberOfParticipants

// Match scores
// Computed from Round.scores for each player/team
```

## Migrations

Migrations are managed by Prisma and stored in `backend/prisma/migrations/`:

1. `init` - Initial schema
2. `add_game_system_and_communities` - Game/community features
3. `refactor_tee_hole_relationship` - TeeHole junction table
4. `remove_tee_yardage_field` - Removed redundant yardage
5. `refactor_rounds_and_games` - Round-centric architecture
6. `normalize_ctp_data` - Centralized CTP tracking
7. `refactor_teetime_and_remove_stored_scores` - TeeTime groups rounds
8. `unify_game_and_match` - Unified Game model

## Full Schema

See [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) for the complete database schema.

For detailed examples and data flow scenarios, see [backend/ARCHITECTURE.md](../backend/ARCHITECTURE.md).
