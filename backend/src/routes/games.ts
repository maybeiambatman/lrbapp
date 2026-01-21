import express from 'express';
import prisma from '../utils/prisma.js';
import { GameFormat, GameStatus } from '@prisma/client';

interface Standing {
  id: string;
  name: string;
  type: string;
  gamesPlayed: number;
  wins: number;
  totalScore: number;
}

const router = express.Router();

// Get all games
router.get('/', async (req, res, next) => {
  try {
    const { format, isActive, status, isTeamGame } = req.query;
    
    const games = await prisma.game.findMany({
      where: {
        ...(format && { format: format as GameFormat }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(status && { status: status as GameStatus }),
        ...(isTeamGame !== undefined && { isTeamGame: isTeamGame === 'true' }),
      },
      include: {
        teams: true,
        team1: true,
        team2: true,
        rounds: {
          include: {
            round: {
              select: {
                id: true,
                date: true,
                player: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            rounds: true,
            teams: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(games);
  } catch (error) {
    next(error);
  }
});

// Get single game
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        teams: true,
        team1: true,
        team2: true,
        rounds: {
          include: {
            round: {
              include: {
                player: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                scores: {
                  include: {
                    holes: true,
                  },
                },
              },
            },
          },
        },
        prizes: true,
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.json(game);
  } catch (error) {
    return next(error);
  }
});

// Create a game
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      format,
      playType,
      scoringType,
      buyInAmount = 0,
      isActive = true,
      isTeamGame = false,
      roundIds = [], // Array of round IDs to link to this game
      teams = [], // Array of team objects: { name, playerIds }
    } = req.body;

    const game = await prisma.game.create({
      data: {
        name,
        format,
        playType,
        scoringType,
        buyInAmount,
        isActive,
        isTeamGame,
        status: 'PENDING',
        rounds: {
          create: roundIds.map((roundId: string) => ({
            roundId,
          })),
        },
        teams: {
          create: teams,
        },
      },
      include: {
        teams: true,
        rounds: {
          include: {
            round: true,
          },
        },
      },
    });

    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
});

// Update a game
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      format,
      playType,
      scoringType,
      buyInAmount,
      isActive,
      status,
      winnerId,
      winnerType,
    } = req.body;

    const game = await prisma.game.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(format !== undefined && { format }),
        ...(playType !== undefined && { playType }),
        ...(scoringType !== undefined && { scoringType }),
        ...(buyInAmount !== undefined && { buyInAmount }),
        ...(isActive !== undefined && { isActive }),
        ...(status !== undefined && { status }),
        ...(winnerId !== undefined && { winnerId }),
        ...(winnerType !== undefined && { winnerType }),
      },
      include: {
        teams: true,
        team1: true,
        team2: true,
        rounds: {
          include: {
            round: true,
          },
        },
      },
    });

    res.json(game);
  } catch (error) {
    next(error);
  }
});

// Delete a game
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.game.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get game leaderboard
router.get('/:id/leaderboard', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        teams: true,
        team1: true,
        team2: true,
        rounds: {
          include: {
            round: {
              include: {
                player: true,
                scores: {
                  include: {
                    holes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Calculate standings based on round scores
    const standings: Standing[] = [];

    if (game.isTeamGame && game.teams.length > 0) {
      // Team-based game - aggregate team scores
      game.teams.forEach(team => {
        const teamRounds = game.rounds.filter(gr => 
          team.playerIds.includes(gr.round.playerId)
        );
        
        const totalScore = teamRounds.reduce((sum, gr) => {
          const roundScore = gr.round.scores[0]; // Assuming one score per round
          return sum + (roundScore?.netTotal || roundScore?.grossTotal || 0);
        }, 0);

        standings.push({
          id: team.id,
          name: team.name,
          type: 'team',
          gamesPlayed: 1,
          wins: game.winnerId === team.id ? 1 : 0,
          totalScore,
        });
      });
    } else {
      // Individual game - show each player
      game.rounds.forEach(gr => {
        const roundScore = gr.round.scores[0];
        const score = game.scoringType === 'NET' 
          ? (roundScore?.netTotal || 0)
          : (roundScore?.grossTotal || 0);

        const existing = standings.find(s => s.id === gr.round.playerId);
        if (existing) {
          existing.totalScore += score;
          existing.gamesPlayed++;
        } else {
          standings.push({
            id: gr.round.playerId,
            name: gr.round.player.name,
            type: 'player',
            gamesPlayed: 1,
            wins: game.winnerId === gr.round.playerId ? 1 : 0,
            totalScore: score,
          });
        }
      });
    }

    // Sort by score (lower is better for golf)
    standings.sort((a, b) => a.totalScore - b.totalScore);

    return res.json({
      game,
      standings,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
