import { Router } from 'express';
import prisma from '../utils/prisma.js';

const router = Router();

// Get scores for a trip
router.get('/trip/:tripId', async (req, res, next) => {
  try {
    const scores = await prisma.roundScore.findMany({
      where: { tripId: req.params.tripId },
      include: {
        holes: { orderBy: { holeNumber: 'asc' } },
        player: true,
        round: {
          select: {
            id: true,
            roundNumber: true,
            date: true,
          },
        },
      },
      orderBy: [
        { netTotal: 'asc' },
      ],
    });
    
    res.json(scores);
  } catch (error) {
    next(error);
  }
});

// Get player scores
router.get('/player/:playerId', async (req, res, next) => {
  try {
    const scores = await prisma.roundScore.findMany({
      where: { playerId: req.params.playerId },
      include: {
        holes: { orderBy: { holeNumber: 'asc' } },
        round: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(scores);
  } catch (error) {
    next(error);
  }
});

// Create or update score
router.post('/', async (req, res, next) => {
  try {
    const { holes, ...scoreData } = req.body;
    
    const score = await prisma.roundScore.upsert({
      where: {
        roundId_playerId: {
          roundId: scoreData.roundId,
          playerId: scoreData.playerId,
        },
      },
      create: {
        ...scoreData,
        holes: { create: holes },
      },
      update: {
        ...scoreData,
        holes: {
          deleteMany: {},
          create: holes,
        },
      },
      include: {
        holes: { orderBy: { holeNumber: 'asc' } },
      },
    });
    
    res.json(score);
  } catch (error) {
    next(error);
  }
});

// Delete score
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.roundScore.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as scoreRoutes };
