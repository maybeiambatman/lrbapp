import type { RoundScore, LeaderboardEntry, Trip, PurseEntry } from '../types';

/**
 * Calculate leaderboard from round scores
 */
export function calculateLeaderboard(
  trip: Trip,
  scores: RoundScore[]
): LeaderboardEntry[] {
  const playerMap = new Map<string, LeaderboardEntry>();

  // Initialize entries for all players
  trip.players.forEach((player) => {
    playerMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      handicap: player.handicap,
      rounds: [],
      totalGross: 0,
      totalNet: 0,
      roundsCompleted: 0,
      position: 0,
    });
  });

  // Add round scores
  scores
    .filter((s) => s.tripId === trip.id)
    .forEach((score) => {
      const entry = playerMap.get(score.playerId);
      if (entry) {
        entry.rounds.push({
          roundNumber: score.roundNumber,
          grossScore: score.grossTotal,
          netScore: score.netTotal,
          isComplete: score.isComplete,
        });
        entry.totalGross += score.grossTotal;
        entry.totalNet += score.netTotal;
        if (score.isComplete) {
          entry.roundsCompleted++;
        }
      }
    });

  // Sort rounds for each player
  playerMap.forEach((entry) => {
    entry.rounds.sort((a, b) => a.roundNumber - b.roundNumber);
  });

  // Convert to array and sort by net score (lower is better)
  const entries = Array.from(playerMap.values())
    .filter((e) => e.rounds.length > 0)
    .sort((a, b) => {
      // First sort by rounds completed (more is better for ranking)
      if (a.roundsCompleted !== b.roundsCompleted) {
        return b.roundsCompleted - a.roundsCompleted;
      }
      // Then by total net score (lower is better)
      return a.totalNet - b.totalNet;
    });

  // Assign positions
  let currentPosition = 1;
  entries.forEach((entry, index) => {
    if (index > 0) {
      const prev = entries[index - 1];
      if (
        entry.roundsCompleted === prev.roundsCompleted &&
        entry.totalNet === prev.totalNet
      ) {
        entry.position = prev.position; // Tie
      } else {
        entry.position = currentPosition;
      }
    } else {
      entry.position = 1;
    }
    currentPosition++;
  });

  return entries;
}

/**
 * Get best net score for a specific round
 */
export function getBestNetForRound(
  scores: RoundScore[],
  tripId: string,
  roundNumber: number
): RoundScore | null {
  const roundScores = scores
    .filter(
      (s) =>
        s.tripId === tripId &&
        s.roundNumber === roundNumber &&
        s.isComplete
    )
    .sort((a, b) => a.netTotal - b.netTotal);

  return roundScores[0] || null;
}

/**
 * Calculate purse/winnings distribution with auto-calculated winners
 */
export function calculatePurse(
  trip: Trip,
  scores: RoundScore[],
  leaderboard: LeaderboardEntry[]
): PurseEntry[] {
  const purseMap = new Map<string, PurseEntry>();

  // Initialize entries for all players
  trip.players.forEach((player) => {
    purseMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      prizes: [],
      totalWinnings: 0,
      netPosition: -player.buyIn, // Start negative (they paid in)
    });
  });

  // Calculate winners for each prize
  trip.prizes.forEach((prize) => {
    let winnerId: string | undefined = prize.winnerId;

    // Auto-calculate winners for score-based prizes
    if (!winnerId) {
      switch (prize.type) {
        case 'best_cumulative_net':
          // Winner is the player with lowest total net who completed all rounds
          if (leaderboard.length > 0 && leaderboard[0].roundsCompleted === trip.numberOfRounds) {
            winnerId = leaderboard[0].playerId;
          }
          break;

        case 'best_net_round':
          if (prize.roundNumber) {
            const bestNet = getBestNetForRound(scores, trip.id, prize.roundNumber);
            if (bestNet) {
              winnerId = bestNet.playerId;
            }
          }
          break;

        case 'closest_to_pin':
          // CTP must be manually awarded - no auto-calculation
          break;
      }
    }

    // Add prize to winner
    if (winnerId) {
      const entry = purseMap.get(winnerId);
      if (entry) {
        entry.prizes.push({
          prizeName: prize.name,
          amount: prize.amount,
        });
        entry.totalWinnings += prize.amount;
        entry.netPosition += prize.amount;
      }
    }
  });

  // Convert to array and sort by total winnings
  return Array.from(purseMap.values()).sort(
    (a, b) => b.totalWinnings - a.totalWinnings
  );
}

/**
 * Get closest to pin entries for a specific round
 */
export function getClosestToPinForRound(
  scores: RoundScore[],
  tripId: string,
  roundNumber: number
): Array<{ playerId: string; playerName: string; holeNumber: number; distance: string }> {
  return scores
    .filter(
      (s) =>
        s.tripId === tripId &&
        s.roundNumber === roundNumber &&
        s.closestToPin
    )
    .map((s) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      holeNumber: s.closestToPin!.holeNumber,
      distance: s.closestToPin!.distance,
    }));
}

/**
 * Get the calculated winner for a prize (either manual or auto-calculated)
 */
export function getPrizeWinner(
  prize: Trip['prizes'][0],
  trip: Trip,
  scores: RoundScore[],
  leaderboard: LeaderboardEntry[]
): { winnerId: string; playerName: string } | null {
  // If manually awarded, use that
  if (prize.winnerId) {
    const player = trip.players.find(p => p.id === prize.winnerId);
    return player ? { winnerId: prize.winnerId, playerName: player.name } : null;
  }

  // Auto-calculate based on prize type
  switch (prize.type) {
    case 'best_cumulative_net':
      if (leaderboard.length > 0 && leaderboard[0].roundsCompleted === trip.numberOfRounds) {
        return { winnerId: leaderboard[0].playerId, playerName: leaderboard[0].playerName };
      }
      break;

    case 'best_net_round':
      if (prize.roundNumber) {
        const bestNet = getBestNetForRound(scores, trip.id, prize.roundNumber);
        if (bestNet) {
          return { winnerId: bestNet.playerId, playerName: bestNet.playerName };
        }
      }
      break;

    case 'closest_to_pin':
      // CTP must be manually awarded
      break;
  }

  return null;
}
