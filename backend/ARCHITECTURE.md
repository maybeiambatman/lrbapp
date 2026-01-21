# Golf Trip Application - Database Architecture

## Overview
This is a fully normalized PostgreSQL database for managing golf trips, rounds, games, and scoring. The schema eliminates all redundant data storage and computes derived values on-the-fly.

## Core Principles
1. **No Redundant Storage**: All computed values (yardage totals, purse totals, match scores) are derived, not stored
2. **Round-Centric**: Rounds are the central entity, can be standalone or part of trips
3. **Proper Golf Modeling**: Yardage and handicap rank vary by tee box per hole
4. **TeeTime Grouping**: TeeTimes group multiple rounds played together (e.g., foursome)

## Key Entities

### Course Structure
```
Course
  ├─ Hole (par only)
  │   └─ TeeHole (yards, handicapRank per tee)
  └─ Tee
      └─ TeeHole (junction table)
```

**Normalization**: Yardage and handicap rank stored once in TeeHole. Tee total yardage is computed.

### Trip & Round Structure
```
Trip
  ├─ TripPlayer (players in the trip)
  ├─ TeeTime[] (scheduled tee times)
  └─ Round[] (rounds played during trip)

TeeTime
  ├─ Round[] (groups rounds played together)
  └─ time (DateTime when tee time starts)

Round (central entity)
  ├─ playerId (the player - required)
  ├─ teeTimeId (optional - groups with other rounds)
  ├─ tripId (optional - can be standalone)
  ├─ courseId (required)
  ├─ Game[] (games played in this round)
  └─ RoundScore[] (hole-by-hole scores)
```

**Normalization**: 
- Each player gets their own Round record
- TeeTime references rounds, not player IDs
- Rounds can be standalone or part of trips
- Unique constraint on [teeTimeId, playerId]

### Game & Match Structure
```
Game (unified - no separate Match model)
  ├─ rounds (many-to-many via GameRound)
  ├─ teams (Team[])
  ├─ team1Id / team2Id (for head-to-head)
  ├─ isTeamGame (boolean)
  ├─ status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  ├─ winnerId (cached result)
  └─ prizes (Prize[])

GameRound (junction table)
  ├─ gameId
  └─ roundId

Team
  ├─ gameId
  ├─ name
  └─ playerIds (String[])
```

**Normalization**:
- Match model removed - Game handles all competition scenarios
- Game can span any combination of rounds (single tee time, multiple tee times, or subset of rounds)
- No purseTotal stored (computed: buyInAmount × participants)
- Game scores computed from Round data across all linked rounds
- Teams used consistently (even 1v1 games use single-player teams)

### Prize & Scoring
```
Prize
  ├─ roundId or gameId
  ├─ type (BEST_NET_ROUND, CLOSEST_TO_PIN, etc.)
  ├─ winnerId
  └─ winnerDistance (for CTP)

RoundScore
  ├─ roundId
  ├─ holeId
  ├─ strokes
  └─ putts
```

**Normalization**:
- CTP tracking only in Prize (removed from RoundScore)
- Single source of truth for all prize tracking

## Computed Fields

### Tee Total Yardage
```typescript
// In API response
tee.totalYardage = tee.holes.reduce((sum, hole) => sum + hole.yards, 0)
```

### Game Purse Total
```typescript
// Computed from participants and buy-in
purseTotal = game.buyInAmount * numberOfParticipants
```

### Match Scores
```typescript
// Computed from Round.scores for each player/team
// No stored score fields in Match model
```

## Example Data Flow

### Scenario 1: Team Game Within Single Tee Time (2v2)
```typescript
// Create game linking to all 4 rounds in the tee time
await prisma.game.create({
  data: {
    name: 'Best Ball',
    format: 'BEST_BALL',
    isTeamGame: true,
    buyInAmount: 50,
    teams: {
      create: [
        { name: 'Team A', playerIds: [player1.id, player2.id] },
        { name: 'Team B', playerIds: [player3.id, player4.id] },
      ],
    },
    rounds: {
      create: teeTimeRounds.map(round => ({ roundId: round.id })),
    },
  },
});
```

### Scenario 2: Multiple 1v1 Games Within One Tee Time
```typescript
// Game 1: Player1 vs Player2
await prisma.game.create({
  data: {
    name: '1v1 Match 1',
    format: 'COMBINED_SCORE',
    isTeamGame: true,
    teams: {
      create: [
        { name: 'Player 1', playerIds: [player1.id] },
        { name: 'Player 2', playerIds: [player2.id] },
      ],
    },
    rounds: {
      create: [
        { roundId: round1.id }, // Player1's round
        { roundId: round2.id }, // Player2's round
      ],
    },
  },
});

// Game 2: Player3 vs Player4
// (similar structure, using round3 and round4)
```

### Scenario 3: Multi-Tee Time Game (8-Player Competition)
```typescript
// Game spanning multiple tee times on the same day or across multiple days
await prisma.game.create({
  data: {
    name: '2-Day Championship',
    format: 'COMBINED_SCORE',
    isTeamGame: true,
    teams: {
      create: [
        { name: 'Team Alpha', playerIds: [p1, p2, p3, p4] },
        { name: 'Team Beta', playerIds: [p5, p6, p7, p8] },
      ],
    },
    rounds: {
      create: [
        ...teeTime1Rounds.map(r => ({ roundId: r.id })),
        ...teeTime2Rounds.map(r => ({ roundId: r.id })),
      ],
    },
  },
});
```

## Migrations Applied
1. `init` - Initial schema
2. `add_game_system_and_communities` - Game/community features
3. `refactor_tee_hole_relationship` - TeeHole junction table
4. `remove_tee_yardage_field` - Removed redundant yardage
5. `refactor_rounds_and_games` - Round-centric architecture
6. `normalize_ctp_data` - Centralized CTP tracking
7. `refactor_teetime_and_remove_stored_scores` - TeeTime groups rounds, removed stored scores
8. `unify_game_and_match` - Removed Match model, Game has many-to-many with Round

## API Patterns

### Fetching Course with Total Yardage
```typescript
const course = await prisma.course.findUnique({
  where: { id },
  include: {
    holes: {
      include: {
        teeHoles: {
          include: { tee: true },
        },
      },
    },
  },
});

// Compute total yardage for each tee
const tees = course.tees.map(tee => ({
  ...tee,
  totalYardage: tee.holes.reduce((sum, hole) => sum + hole.yards, 0),
}));
```

### Fetching Trip with All Data
```typescript
const trip = await prisma.trip.findUnique({
  where: { id },
  include: {
    teeTimes: {
      include: {
        rounds: {
          include: {
            player: true,
            scores: true,
          },
        },
      },
    },
    players: true,
  },
});
```

## Benefits of This Architecture
1. **Single Source of Truth**: No duplicate data, eliminating inconsistencies
2. **Flexible**: Supports both trips and standalone rounds
3. **Scalable**: Computed values don't add storage overhead
4. **Maintainable**: Changes to scoring logic don't require migrations
5. **Accurate**: Reflects real golf logistics (teetime groups players' rounds)
6. **Simple**: Unified Game model handles all competition scenarios (no confusing Match/Game split)
7. **Versatile**: Games can span any combination of rounds - single tee time, multiple tee times, or subset of players
