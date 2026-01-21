import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all trips
router.get('/', async (_req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        players: true,
        courses: true,
        teeTimes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// Get trip by ID
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        players: true,
        courses: { include: { holes: true, tees: true } },
        teeTimes: true,
      },
    });
    
    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Get trip by code
router.get('/code/:code', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { code: req.params.code.toUpperCase() },
      include: {
        players: true,
        courses: { include: { holes: true, tees: true } },
        teeTimes: true,
      },
    });
    
    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Create trip
router.post('/', async (req, res, next) => {
  try {
    const trip = await prisma.trip.create({
      data: {
        ...req.body,
        code: req.body.code.toUpperCase(),
      },
      include: {
        players: true,
        courses: true,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// Update trip
router.put('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        players: true,
        courses: true,
      },
    });
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// Delete trip
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add player to trip
router.post('/:id/players', async (req, res, next) => {
  try {
    const player = await prisma.tripPlayer.create({
      data: {
        tripId: req.params.id,
        ...req.body,
      },
    });
    
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
});

export { router as tripRoutes };
