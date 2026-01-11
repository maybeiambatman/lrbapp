import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by email
router.get('/email/:email', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
