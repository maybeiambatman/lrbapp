import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get scores for a trip
router.get('/trip/:tripId', async (req, res, next) => {
  try {
    const { round } = req.query;
    
    const where: any = { tripId: req.params.tripId };
    if (round) {
      where.roundNumber = parseInt(round as string);
    }
    
    const scores = await prisma.roundScore.findMany({
      where,
      include: {
        holes: { orderBy: { holeNumber: 'asc' } },
        player: true,
      },
      orderBy: [
        { roundNumber: 'asc' },
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
        course: true,
      },
      orderBy: { roundNumber: 'asc' },
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
        tripId_playerId_roundNumber: {
          tripId: scoreData.tripId,
          playerId: scoreData.playerId,
          roundNumber: scoreData.roundNumber,
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
