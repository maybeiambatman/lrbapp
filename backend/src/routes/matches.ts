import express from 'express';
import prisma from '../utils/prisma.js';
import { MatchStatus } from '@prisma/client';

const router = express.Router();

// Get all matches
router.get('/', async (req, res, next) => {
  try {
    const { gameId, roundNumber, status, isTeamMatch } = req.query;
    
    const matches = await prisma.match.findMany({
      where: {
        ...(gameId && { gameId: gameId as string }),
        ...(roundNumber && { roundNumber: parseInt(roundNumber as string) }),
        ...(status && { status: status as MatchStatus }),
        ...(isTeamMatch !== undefined && { isTeamMatch: isTeamMatch === 'true' }),
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            format: true,
            playType: true,
            scoringType: true,
          },
        },
        team1: true,
        team2: true,
      },
      orderBy: [
        { roundNumber: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(matches);
  } catch (error) {
    next(error);
  }
});

// Get single match
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        game: true,
        team1: true,
        team2: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
});

// Create a match
router.post('/', async (req, res, next) => {
  try {
    const {
      gameId,
      roundNumber,
      status = 'PENDING',
      isTeamMatch = false,
      team1Id,
      team2Id,
      player1Id,
      player2Id,
    } = req.body;

    const match = await prisma.match.create({
      data: {
        gameId,
        roundNumber,
        status,
        isTeamMatch,
        ...(team1Id && { team1Id }),
        ...(team2Id && { team2Id }),
        ...(player1Id && { player1Id }),
        ...(player2Id && { player2Id }),
      },
      include: {
        game: true,
        team1: true,
        team2: true,
      },
    });

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
});

// Update a match (including scores and status)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      team1Score,
      team2Score,
      player1Score,
      player2Score,
      winnerId,
      winnerType,
    } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(team1Score !== undefined && { team1Score }),
        ...(team2Score !== undefined && { team2Score }),
        ...(player1Score !== undefined && { player1Score }),
        ...(player2Score !== undefined && { player2Score }),
        ...(winnerId !== undefined && { winnerId }),
        ...(winnerType !== undefined && { winnerType }),
      },
      include: {
        game: true,
        team1: true,
        team2: true,
      },
    });

    res.json(match);
  } catch (error) {
    next(error);
  }
});

// Delete a match
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.match.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Complete a match (updates status and determines winner)
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { team1Score, team2Score, player1Score, player2Score } = req.body;

    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let winnerId = null;
    let winnerType = null;

    if (match.isTeamMatch && team1Score !== undefined && team2Score !== undefined) {
      if (team1Score > team2Score) {
        winnerId = match.team1Id;
        winnerType = 'team';
      } else if (team2Score > team1Score) {
        winnerId = match.team2Id;
        winnerType = 'team';
      }
    } else if (!match.isTeamMatch && player1Score !== undefined && player2Score !== undefined) {
      if (player1Score > player2Score) {
        winnerId = match.player1Id;
        winnerType = 'player';
      } else if (player2Score > player1Score) {
        winnerId = match.player2Id;
        winnerType = 'player';
      }
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        ...(team1Score !== undefined && { team1Score }),
        ...(team2Score !== undefined && { team2Score }),
        ...(player1Score !== undefined && { player1Score }),
        ...(player2Score !== undefined && { player2Score }),
        ...(winnerId && { winnerId }),
        ...(winnerType && { winnerType }),
      },
      include: {
        game: true,
        team1: true,
        team2: true,
      },
    });

    res.json(updatedMatch);
  } catch (error) {
    next(error);
  }
});

export default router;
