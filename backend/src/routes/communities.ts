import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all communities
router.get('/', async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    const communities = await prisma.community.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(communities);
  } catch (error) {
    next(error);
  }
});

// Get single community
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    next(error);
  }
});

// Create a community
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      description,
      isActive = true,
      createdBy,
      memberIds = [],
    } = req.body;

    const community = await prisma.community.create({
      data: {
        name,
        description,
        isActive,
        createdBy,
        members: {
          connect: [
            { id: createdBy }, // Always include creator
            ...memberIds.filter((id: string) => id !== createdBy).map((id: string) => ({ id })),
          ],
        },
      },
      include: {
        creator: true,
        members: true,
      },
    });

    res.status(201).json(community);
  } catch (error) {
    next(error);
  }
});

// Update a community
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isActive,
    } = req.body;

    const community = await prisma.community.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        creator: true,
        members: true,
      },
    });

    res.json(community);
  } catch (error) {
    next(error);
  }
});

// Delete a community
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.community.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add member to community
router.post('/:id/members', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const community = await prisma.community.update({
      where: { id },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        creator: true,
        members: true,
      },
    });

    res.json(community);
  } catch (error) {
    next(error);
  }
});

// Remove member from community
router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const community = await prisma.community.update({
      where: { id },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
      include: {
        creator: true,
        members: true,
      },
    });

    res.json(community);
  } catch (error) {
    next(error);
  }
});

export default router;
