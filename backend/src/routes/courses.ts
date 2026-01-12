import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all courses
router.get('/', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        holes: {
          orderBy: { number: 'asc' },
          include: {
            teeHoles: {
              include: {
                tee: true,
              },
            },
          },
        },
        tees: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get course by ID
router.get('/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        holes: {
          orderBy: { number: 'asc' },
          include: {
            teeHoles: {
              include: {
                tee: true,
              },
            },
          },
        },
        tees: true,
      },
    });
    
    if (!course) {
      throw new AppError(404, 'Course not found');
    }
    
    res.json(course);
  } catch (error) {
    next(error);
  }
});

// Create course
router.post('/', async (req, res, next) => {
  try {
    const { holes, tees, ...courseData } = req.body;
    
    const course = await prisma.course.create({
      data: {
        ...courseData,
        holes: { create: holes },
        tees: { create: tees },
      },
      include: {
        holes: {
          orderBy: { number: 'asc' },
          include: {
            teeHoles: {
              include: {
                tee: true,
              },
            },
          },
        },
        tees: true,
      },
    });
    
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

// Update course
router.put('/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        holes: {
          orderBy: { number: 'asc' },
          include: {
            teeHoles: {
              include: {
                tee: true,
              },
            },
          },
        },
        tees: true,
      },
    });
    res.json(course);
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as courseRoutes };
