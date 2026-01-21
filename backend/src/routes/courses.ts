import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Get all courses
router.get('/', async (_req, res, next) => {
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
        tees: {
          include: {
            holes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Add computed totalYardage to each tee
    const coursesWithYardage = courses.map(course => ({
      ...course,
      tees: course.tees.map(tee => {
        const { holes, ...teeData } = tee;
        return {
          ...teeData,
          totalYardage: holes.reduce((sum, hole) => sum + hole.yards, 0),
        };
      }),
    }));

    res.json(coursesWithYardage);
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
        tees: {
          include: {
            holes: true,
          },
        },
      },
    });
    
    if (!course) {
      throw new AppError(404, 'Course not found');
    }

    // Add computed totalYardage to each tee
    const courseWithYardage = {
      ...course,
      tees: course.tees.map(tee => {
        const { holes, ...teeData } = tee;
        return {
          ...teeData,
          totalYardage: holes.reduce((sum, hole) => sum + hole.yards, 0),
        };
      }),
    };
    
    res.json(courseWithYardage);
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
        tees: {
          include: {
            holes: true,
          },
        },
      },
    });

    // Add computed totalYardage to each tee
    const courseWithYardage = {
      ...course,
      tees: course.tees.map(tee => {
        const { holes, ...teeData } = tee;
        return {
          ...teeData,
          totalYardage: holes.reduce((sum, hole) => sum + hole.yards, 0),
        };
      }),
    };
    
    res.status(201).json(courseWithYardage);
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
        tees: {
          include: {
            holes: true,
          },
        },
      },
    });

    // Add computed totalYardage to each tee
    const courseWithYardage = {
      ...course,
      tees: course.tees.map(tee => {
        const { holes, ...teeData } = tee;
        return {
          ...teeData,
          totalYardage: holes.reduce((sum, hole) => sum + hole.yards, 0),
        };
      }),
    };

    res.json(courseWithYardage);
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
