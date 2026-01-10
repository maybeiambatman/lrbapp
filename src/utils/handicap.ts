import type { Hole, HoleScore, Course } from '../types';

/**
 * Calculate the number of strokes a player receives on the course
 * based on their handicap and the course slope/rating
 */
export function calculateCourseHandicap(
  playerHandicap: number,
  courseSlope: number = 113,
  _courseRating: number = 72
): number {
  // Course Handicap = Handicap Index × (Slope Rating / 113)
  // Note: courseRating is kept for future use in more precise calculations
  // Rounded to nearest whole number
  return Math.round(playerHandicap * (courseSlope / 113));
}

/**
 * Calculate how many strokes a player receives on each hole
 * based on their course handicap and hole handicap rankings
 */
export function calculateStrokesPerHole(
  courseHandicap: number,
  holes: Hole[]
): Map<number, number> {
  const strokesMap = new Map<number, number>();

  // Sort holes by handicap rank
  const sortedHoles = [...holes].sort((a, b) => a.handicapRank - b.handicapRank);

  // Distribute strokes based on handicap
  let remainingStrokes = courseHandicap;

  // First pass: everyone gets at least 0 strokes
  holes.forEach(hole => {
    strokesMap.set(hole.number, 0);
  });

  // Distribute strokes to hardest holes first
  // If handicap > 18, player gets multiple strokes on hardest holes
  let round = 0;
  while (remainingStrokes > 0) {
    for (const hole of sortedHoles) {
      if (remainingStrokes <= 0) break;
      const currentStrokes = strokesMap.get(hole.number) || 0;
      if (currentStrokes === round) {
        strokesMap.set(hole.number, currentStrokes + 1);
        remainingStrokes--;
      }
    }
    round++;
    // Safety check to prevent infinite loop
    if (round > 10) break;
  }

  return strokesMap;
}

/**
 * Calculate net score for a single hole
 */
export function calculateNetScore(
  grossScore: number,
  strokesReceived: number
): number {
  return grossScore - strokesReceived;
}

/**
 * Calculate complete hole scores with net calculations
 */
export function calculateRoundScores(
  grossScores: number[],
  playerHandicap: number,
  course: Course
): HoleScore[] {
  const courseHandicap = calculateCourseHandicap(
    playerHandicap,
    course.slope,
    course.rating
  );

  const strokesMap = calculateStrokesPerHole(courseHandicap, course.holes);

  return course.holes.map((hole, index) => {
    const grossScore = grossScores[index] || 0;
    const strokesReceived = strokesMap.get(hole.number) || 0;

    return {
      holeNumber: hole.number,
      grossScore,
      netScore: calculateNetScore(grossScore, strokesReceived),
      strokesReceived,
    };
  });
}

/**
 * Calculate total scores for a round
 */
export function calculateRoundTotals(holes: HoleScore[]): {
  grossTotal: number;
  netTotal: number;
} {
  return holes.reduce(
    (acc, hole) => ({
      grossTotal: acc.grossTotal + hole.grossScore,
      netTotal: acc.netTotal + hole.netScore,
    }),
    { grossTotal: 0, netTotal: 0 }
  );
}

/**
 * Calculate par for the course
 */
export function calculateCoursePar(holes: Hole[]): number {
  return holes.reduce((total, hole) => total + hole.par, 0);
}

/**
 * Format score relative to par
 */
export function formatScoreToPar(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return 'E';
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

/**
 * Generate a random trip code
 */
export function generateTripCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
