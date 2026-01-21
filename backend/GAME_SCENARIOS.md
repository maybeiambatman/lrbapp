# Game Scenarios - How the Unified Model Works

## Overview
The unified `Game` model eliminates the confusing Game/Match split. Now a **Game** is simply a competition that can involve any combination of rounds.

## Schema Key Points

```prisma
model Game {
  // Competition details
  name        String
  format      GameFormat
  buyInAmount Float
  status      GameStatus
  isTeamGame  Boolean
  
  // Head-to-head competitors
  team1Id     String?
  team2Id     String?
  
  // Many-to-many with rounds
  rounds      GameRound[]
  teams       Team[]
  winnerId    String?  // Computed and cached
}

model GameRound {
  gameId  String
  roundId String
  @@id([gameId, roundId])
}
```

## Scenario 1: Team Game Within Single Tee Time

**Setup**: 4 players in one tee time playing 2v2 Best Ball

```
TeeTime (8:00 AM)
├─ Round 1 (Tiger)   ───┐
├─ Round 2 (Phil)    ───┼─→ Game: "Best Ball"
├─ Round 3 (Rory)    ───┤   • Team 1: Tiger & Phil
└─ Round 4 (Jordan)  ───┘   • Team 2: Rory & Jordan
```

**Data**:
```typescript
Game: {
  name: "Best Ball",
  isTeamGame: true,
  team1Id: "team-tiger-phil",
  team2Id: "team-rory-jordan",
  rounds: [round1, round2, round3, round4]
}
```

**Result**: One game spanning all 4 rounds in the tee time. Scores are aggregated from all rounds to determine the winning team.

---

## Scenario 2: Multiple Games Within One Tee Time

**Setup**: 4 players in one tee time playing two separate 1v1 matches

```
TeeTime (8:00 AM)
├─ Round 1 (Tiger)   ───┬─→ Game 1: "Tiger vs Phil"
├─ Round 2 (Phil)    ───┘
├─ Round 3 (Rory)    ───┬─→ Game 2: "Rory vs Jordan"
└─ Round 4 (Jordan)  ───┘
```

**Data**:
```typescript
Game 1: {
  name: "Tiger vs Phil",
  isTeamGame: true,
  team1Id: "team-tiger" (single player),
  team2Id: "team-phil" (single player),
  rounds: [round1, round2]
}

Game 2: {
  name: "Rory vs Jordan",
  isTeamGame: true,
  team1Id: "team-rory",
  team2Id: "team-jordan",
  rounds: [round3, round4]
}
```

**Result**: Two independent games in the same tee time. Each game only sees the rounds of its participants.

---

## Scenario 3: Game Spanning Multiple Tee Times

**Setup**: 8 players across 2 tee times playing 4v4 team competition

```
TeeTime 1 (8:00 AM)
├─ Round 1 (Tiger)   ───┐
├─ Round 2 (Phil)    ───┤
├─ Round 3 (Rory)    ───┼─→ Game: "4v4 Championship"
└─ Round 4 (Jordan)  ───┤   • Team Alpha: Tiger, Phil, Rory, Jordan
                         │   • Team Beta: Dustin, Brooks, Justin, Bryson
TeeTime 2 (8:30 AM)      │
├─ Round 5 (Dustin)  ───┤
├─ Round 6 (Brooks)  ───┤
├─ Round 7 (Justin)  ───┤
└─ Round 8 (Bryson)  ───┘
```

**Data**:
```typescript
Game: {
  name: "4v4 Championship",
  isTeamGame: true,
  team1Id: "team-alpha",
  team2Id: "team-beta",
  rounds: [round1, round2, round3, round4, round5, round6, round7, round8]
}
```

**Result**: One game spanning 8 rounds across 2 different tee times. Scores are aggregated from all rounds.

---

## Scenario 4: Multi-Day Tournament

**Setup**: Same 4 players playing over 2 days (8 total rounds)

```
Day 1 - TeeTime (8:00 AM)
├─ Round 1 (Tiger)   ───┐
├─ Round 2 (Phil)    ───┤
├─ Round 3 (Rory)    ───┼─→ Game: "2-Day Best Ball"
└─ Round 4 (Jordan)  ───┤   • Team 1: Tiger & Phil
                         │   • Team 2: Rory & Jordan
Day 2 - TeeTime (8:00 AM)│
├─ Round 5 (Tiger)   ───┤
├─ Round 6 (Phil)    ───┤
├─ Round 7 (Rory)    ───┤
└─ Round 8 (Jordan)  ───┘
```

**Data**:
```typescript
Game: {
  name: "2-Day Best Ball",
  isTeamGame: true,
  team1Id: "team-tiger-phil",
  team2Id: "team-rory-jordan",
  rounds: [round1, round2, round3, round4, round5, round6, round7, round8]
}
```

**Result**: Cumulative scoring across 2 days. Each player has 2 rounds, totaling 8 rounds in the game.

---

## Scenario 5: Skins Game (Multi-Player, No Teams)

**Setup**: 4 players competing individually for skins

```
TeeTime (8:00 AM)
├─ Round 1 (Tiger)   ───┐
├─ Round 2 (Phil)    ───┼─→ Game: "Skins"
├─ Round 3 (Rory)    ───┤   • No teams (individual competition)
└─ Round 4 (Jordan)  ───┘   • Winner determined hole-by-hole
```

**Data**:
```typescript
Game: {
  name: "Skins",
  format: "SKINS",
  isTeamGame: false,
  team1Id: null,
  team2Id: null,
  rounds: [round1, round2, round3, round4]
}
```

**Result**: No teams needed. Game logic determines winners based on hole-by-hole comparison across all rounds.

---

## Key Advantages

### 1. **No Artificial Constraints**
- Games aren't locked to a single round
- Games aren't locked to a single tee time
- Games can span any time period

### 2. **Consistency**
- All competitions use the same `Game` model
- No confusion about when to create a Match vs when to create a Game
- Teams used consistently (even for 1v1 with single-player teams)

### 3. **Flexibility**
```
One Round → Many Games   (Multiple games during one round)
One Game → Many Rounds   (Game spanning multiple rounds)
Many Games → Many Rounds (Complex tournament structures)
```

### 4. **Real-World Modeling**
Matches the way golfers actually think:
- "Let's play a best ball match today" → One game, one tee time
- "Let's do two 1v1 matches" → Two games, one tee time  
- "Let's do a 2-day team event" → One game, multiple tee times
- "Let's combine two foursomes for an 8-player event" → One game, two tee times

### 5. **Computed Scoring**
- Game results computed from all linked rounds
- No redundant score storage
- Single source of truth: the Round scores
- Winner cached in Game.winnerId for performance

---

## Query Examples

### Get all games for a specific tee time
```typescript
const games = await prisma.game.findMany({
  where: {
    rounds: {
      some: {
        round: {
          teeTimeId: teeTimeId
        }
      }
    }
  },
  include: {
    rounds: {
      include: {
        round: {
          include: {
            scores: true,
            player: true
          }
        }
      }
    },
    teams: true
  }
});
```

### Get all rounds involved in a game
```typescript
const gameWithRounds = await prisma.game.findUnique({
  where: { id: gameId },
  include: {
    rounds: {
      include: {
        round: {
          include: {
            player: true,
            scores: true
          }
        }
      }
    }
  }
});
```

### Compute game results
```typescript
// Get all rounds in the game
const rounds = gameWithRounds.rounds.map(gr => gr.round);

// Aggregate scores based on game format
if (game.isTeamGame) {
  // Group rounds by team
  const team1Rounds = rounds.filter(r => 
    team1.playerIds.includes(r.playerId)
  );
  const team2Rounds = rounds.filter(r => 
    team2.playerIds.includes(r.playerId)
  );
  
  // Compute team scores based on format
  // (best ball, combined score, etc.)
} else {
  // Individual competition - compare all players
}
```

---

## Migration Impact

**Removed:**
- `Match` model entirely
- Confusing Game → Match hierarchy

**Added:**
- `GameRound` junction table for many-to-many
- `Game.status`, `Game.isTeamGame`, `Game.team1Id`, `Game.team2Id` (moved from Match)
- `GameStatus` enum (renamed from MatchStatus)

**Result:**
Simpler, more flexible, more intuitive schema that matches how golfers think about games.
