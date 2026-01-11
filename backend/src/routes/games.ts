import express from 'express';
import prisma from '../utils/prisma.js';
import { GameFormat } from '@prisma/client';

interface Standing {
  id: string;
  name: string;
  type: string;
  matches: number;
  wins: number;
  score: number;
}

const router = express.Router();

// Get all games
router.get('/', async (req, res, next) => {
  try {
    const { tripId, roundNumber, format, isActive } = req.query;
    
    const games = await prisma.game.findMany({
      where: {
        ...(tripId && { tripId: tripId as string }),
        ...(roundNumber && { roundNumber: parseInt(roundNumber as string) }),
        ...(format && { format: format as GameFormat }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teams: {
          include: {
            game: {
              select: {
                name: true,
              },
            },
          },
        },
        matches: {
          include: {
            team1: true,
            team2: true,
          },
        },
        _count: {
          select: {
            matches: true,
            teams: true,
          },
        },
      },
      orderBy: [
        { roundNumber: 'asc' },
        { createdAt: 'desc' },
      ],
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
        trip: true,
        teams: true,
        matches: {
          include: {
            team1: true,
            team2: true,
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
});

// Create a game
router.post('/', async (req, res, next) => {
  try {
    const {
      tripId,
      name,
      format,
      playType,
      scoringType,
      roundNumber,
      buyInAmount = 0,
      purseTotal = 0,
      isActive = true,
    } = req.body;

    const game = await prisma.game.create({
      data: {
        tripId,
        name,
        format,
        playType,
        scoringType,
        roundNumber,
        buyInAmount,
        purseTotal,
        isActive,
      },
      include: {
        trip: true,
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
      roundNumber,
      buyInAmount,
      purseTotal,
      isActive,
    } = req.body;

    const game = await prisma.game.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(format !== undefined && { format }),
        ...(playType !== undefined && { playType }),
        ...(scoringType !== undefined && { scoringType }),
        ...(roundNumber !== undefined && { roundNumber }),
        ...(buyInAmount !== undefined && { buyInAmount }),
        ...(purseTotal !== undefined && { purseTotal }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        trip: true,
        teams: true,
        matches: true,
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
        matches: {
          include: {
            team1: true,
            team2: true,
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Calculate standings based on match results
    const standings = game.matches.reduce((acc: Standing[], match) => {
      if (match.isTeamMatch) {
        // Team match standings
        if (match.team1 && match.team1Id) {
          const existing = acc.find(s => s.id === match.team1Id);
          if (existing) {
            existing.matches++;
            if (match.winnerId === match.team1Id) existing.wins++;
            if (match.status === 'COMPLETED') existing.score += (match.team1Score || 0);
          } else {
            acc.push({
              id: match.team1Id,
              name: match.team1.name,
              type: 'team',
              matches: 1,
              wins: match.winnerId === match.team1Id ? 1 : 0,
              score: match.team1Score || 0,
            });
          }
        }
        if (match.team2 && match.team2Id) {
          const existing = acc.find(s => s.id === match.team2Id);
          if (existing) {
            existing.matches++;
            if (match.winnerId === match.team2Id) existing.wins++;
            if (match.status === 'COMPLETED') existing.score += (match.team2Score || 0);
          } else {
            acc.push({
              id: match.team2Id,
              name: match.team2.name,
              type: 'team',
              matches: 1,
              wins: match.winnerId === match.team2Id ? 1 : 0,
              score: match.team2Score || 0,
            });
          }
        }
      }
      return acc;
    }, []);

    standings.sort((a, b) => b.wins - a.wins || b.score - a.score);

    res.json({
      game,
      standings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
