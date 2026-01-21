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
        game: {
          include: {
            rounds: {
              include: {
                round: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get player details from the rounds
    const players = team.game.rounds
      .map(gr => gr.round.player)
      .filter(p => team.playerIds.includes(p.id));

    return res.json({
      ...team,
      players,
    });
  } catch (error) {
    return next(error);
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
        game: {
          include: {
            rounds: {
              include: {
                round: {
                  include: {
                    player: true,
                    scores: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Calculate team stats from rounds
    const teamRounds = team.game.rounds.filter(gr =>
      team.playerIds.includes(gr.round.playerId)
    );

    const totalScore = teamRounds.reduce((sum, gr) => {
      const roundScore = gr.round.scores[0];
      return sum + (roundScore?.netTotal || roundScore?.grossTotal || 0);
    }, 0);

    const stats = {
      totalRounds: teamRounds.length,
      totalScore,
      averageScore: teamRounds.length > 0 ? totalScore / teamRounds.length : 0,
      isWinner: team.game.winnerId === team.id,
    };

    return res.json({
      team,
      stats,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
