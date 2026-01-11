import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res, next) => {
  try {
    const { gameId } = req.query;
    
    const teams = await prisma.team.findMany({
      where: {
        ...(gameId && { gameId: gameId as string }),
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            format: true,
            tripId: true,
          },
        },
        _count: {
          select: {
            team1Matches: true,
            team2Matches: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// Get single team
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        game: true,
        team1Matches: {
          include: {
            team2: true,
          },
        },
        team2Matches: {
          include: {
            team1: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get player details from the trip
    const game = await prisma.game.findUnique({
      where: { id: team.gameId },
      include: {
        trip: {
          include: {
            players: {
              where: {
                id: {
                  in: team.playerIds,
                },
              },
            },
          },
        },
      },
    });

    res.json({
      ...team,
      players: game?.trip?.players || [],
    });
  } catch (error) {
    next(error);
  }
});

// Create a team
router.post('/', async (req, res, next) => {
  try {
    const {
      gameId,
      name,
      playerIds = [],
    } = req.body;

    const team = await prisma.team.create({
      data: {
        gameId,
        name,
        playerIds,
      },
      include: {
        game: true,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// Update a team
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      playerIds,
    } = req.body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(playerIds !== undefined && { playerIds }),
      },
      include: {
        game: true,
      },
    });

    res.json(team);
  } catch (error) {
    next(error);
  }
});

// Delete a team
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.team.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get team statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        team1Matches: true,
        team2Matches: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const allMatches = [...team.team1Matches, ...team.team2Matches];
    
    const stats = {
      totalMatches: allMatches.length,
      completed: allMatches.filter(m => m.status === 'COMPLETED').length,
      pending: allMatches.filter(m => m.status === 'PENDING').length,
      inProgress: allMatches.filter(m => m.status === 'IN_PROGRESS').length,
      wins: allMatches.filter(m => m.winnerId === id).length,
      losses: allMatches.filter(m => m.status === 'COMPLETED' && m.winnerId && m.winnerId !== id).length,
      ties: allMatches.filter(m => m.status === 'COMPLETED' && !m.winnerId).length,
      totalScore: allMatches.reduce((sum, m) => {
        if (m.team1Id === id) return sum + (m.team1Score || 0);
        if (m.team2Id === id) return sum + (m.team2Score || 0);
        return sum;
      }, 0),
    };

    res.json({
      team,
      stats,
      matches: allMatches,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
