import Tesseract from 'tesseract.js';
import type { Hole, Tee } from '../types';
import { generateId } from './handicap';

export interface ParsedTee {
  name: string;
  color?: string;
  rating: number;
  slope: number;
  yardage?: number;
}

export interface ParsedScorecard {
  courseName?: string;
  tees: ParsedTee[];
  holes: Hole[];
  confidence: number;
  rawText: string;
}

interface ParseProgress {
  status: string;
  progress: number;
}

// Common tee colors and their CSS values
const TEE_COLORS: Record<string, string> = {
  gold: '#d4af37',
  championship: '#d4af37',
  black: '#1a1a1a',
  blue: '#1e40af',
  white: '#f5f5f5',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#f97316',
  yellow: '#eab308',
  silver: '#9ca3af',
  'gr/wh': '#22c55e',
  'green/white': '#22c55e',
};

/**
 * Parse a golf scorecard image using OCR
 */
export async function parseScorecardImage(
  imageFile: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedScorecard> {
  // Convert file to data URL
  const imageUrl = await fileToDataUrl(imageFile);

  // Perform OCR
  onProgress?.({ status: 'Initializing OCR engine...', progress: 0 });

  const result = await Tesseract.recognize(imageUrl, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress?.({
          status: 'Reading scorecard...',
          progress: Math.round(m.progress * 80),
        });
      }
    },
  });

  onProgress?.({ status: 'Parsing scorecard data...', progress: 85 });

  const rawText = result.data.text;
  const parsedData = parseOcrText(rawText);

  onProgress?.({ status: 'Complete!', progress: 100 });

  return {
    ...parsedData,
    confidence: result.data.confidence,
    rawText,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Parse OCR text to extract scorecard data
 */
function parseOcrText(text: string): Omit<ParsedScorecard, 'confidence' | 'rawText'> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Try to find course name (usually at the top, often in larger text)
  let courseName: string | undefined;
  for (const line of lines.slice(0, 5)) {
    // Look for lines that might be course names (not numbers, not short)
    if (line.length > 5 && !/^\d+$/.test(line) && !line.toLowerCase().includes('hole')) {
      courseName = line.replace(/[^a-zA-Z\s]/g, '').trim();
      if (courseName.length > 3) break;
    }
  }

  // Extract tee information (multiple tees with ratings/slopes)
  const tees = extractTees(text, lines);

  // Initialize holes with defaults
  const holes: Hole[] = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: 4,
    handicapRank: i + 1,
    yards: 350,
  }));

  // Try to find par values
  const parValues = extractParValues(text, lines);
  if (parValues.length >= 9) {
    parValues.forEach((par, i) => {
      if (i < 18 && par >= 3 && par <= 5) {
        holes[i].par = par;
      }
    });
  }

  // Try to find handicap rankings
  const handicapValues = extractHandicapValues(lines);
  if (handicapValues.length >= 9) {
    handicapValues.forEach((hcp, i) => {
      if (i < 18 && hcp >= 1 && hcp <= 18) {
        holes[i].handicapRank = hcp;
      }
    });
  }

  return {
    courseName,
    tees,
    holes,
  };
}

/**
 * Extract tee information from OCR text
 */
function extractTees(text: string, lines: string[]): ParsedTee[] {
  const tees: ParsedTee[] = [];
  const foundTees = new Set<string>();

  // Common tee name patterns
  const teeNames = ['gold', 'blue', 'white', 'red', 'green', 'black', 'orange', 'yellow', 'silver', 'championship', 'gr/wh', 'green/white'];

  // Pattern 1: "TeeName Rating/Slope" format (e.g., "Gold 73.3/137")
  // Pattern 2: "Men TeeName Rating/Slope" format
  // Pattern 3: Table format with rating and slope columns

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    for (const teeName of teeNames) {
      if (lowerLine.includes(teeName) && !foundTees.has(teeName)) {
        // Try to extract rating/slope from this line
        // Look for pattern like "73.3/137" or "73.3 137" or rating followed by slope
        const ratingPattern = /(\d{2}\.\d)[\s/]+(\d{2,3})/g;
        const matches = [...line.matchAll(ratingPattern)];

        if (matches.length > 0) {
          // First match is typically men's rating/slope
          const [, rating, slope] = matches[0];
          const parsedRating = parseFloat(rating);
          const parsedSlope = parseInt(slope);

          // Validate reasonable values
          if (parsedRating >= 60 && parsedRating <= 80 && parsedSlope >= 55 && parsedSlope <= 155) {
            foundTees.add(teeName);
            tees.push({
              name: teeName.charAt(0).toUpperCase() + teeName.slice(1),
              color: TEE_COLORS[teeName],
              rating: parsedRating,
              slope: parsedSlope,
            });
          }
        }
      }
    }
  }

  // Pattern 4: Look for "Course Ratings" section with tabular data
  if (tees.length === 0) {
    // Try to find rating/slope patterns with nearby tee names
    const ratingMatches = text.match(/(\d{2}\.\d)[\s/]+(\d{2,3})/g);
    if (ratingMatches) {
      for (const match of ratingMatches) {
        const parts = match.match(/(\d{2}\.\d)[\s/]+(\d{2,3})/);
        if (parts) {
          const rating = parseFloat(parts[1]);
          const slope = parseInt(parts[2]);

          // Only add if it looks like a valid rating/slope
          if (rating >= 60 && rating <= 80 && slope >= 55 && slope <= 155) {
            // Check if we already have a similar rating
            const isDuplicate = tees.some(t => Math.abs(t.rating - rating) < 0.5 && Math.abs(t.slope - slope) < 3);
            if (!isDuplicate && tees.length < 6) {
              // Try to guess tee name based on rating (higher rating = back tees)
              let teeName = `Tee ${tees.length + 1}`;
              if (tees.length === 0 && rating > 72) teeName = 'Back';
              else if (tees.length === 0) teeName = 'White';
              else if (rating > 72) teeName = 'Championship';
              else if (rating > 70) teeName = 'Blue';
              else teeName = 'Forward';

              tees.push({
                name: teeName,
                rating,
                slope,
              });
            }
          }
        }
      }
    }
  }

  // Sort tees by rating (highest first - back tees)
  tees.sort((a, b) => b.rating - a.rating);

  return tees;
}

/**
 * Extract par values from OCR text
 */
function extractParValues(text: string, lines: string[]): number[] {
  const parValues: number[] = [];

  // Look for a line that starts with PAR
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('par') || lowerLine.includes('par ')) {
      // Extract numbers from this line
      const numbers = line.match(/\b[345]\b/g);
      if (numbers && numbers.length >= 9) {
        parValues.push(...numbers.map(Number));
      }
    }
  }

  // If we didn't find a clear PAR line, look for sequences of 3,4,5
  if (parValues.length < 9) {
    const allNumbers = text.match(/\b[345]\b/g);
    if (allNumbers) {
      // Find a sequence that looks like pars (9 or 18 consecutive 3,4,5 values)
      for (let i = 0; i <= allNumbers.length - 9; i++) {
        const sequence = allNumbers.slice(i, i + 9).map(Number);
        const sum = sequence.reduce((a, b) => a + b, 0);
        // Front 9 typically sums to 34-38
        if (sum >= 34 && sum <= 38) {
          parValues.push(...sequence);
          // Look for back 9
          if (i + 18 <= allNumbers.length) {
            const back9 = allNumbers.slice(i + 9, i + 18).map(Number);
            const backSum = back9.reduce((a, b) => a + b, 0);
            if (backSum >= 34 && backSum <= 38) {
              parValues.push(...back9);
            }
          }
          break;
        }
      }
    }
  }

  return parValues;
}

/**
 * Extract handicap ranking values from OCR text
 */
function extractHandicapValues(lines: string[]): number[] {
  const handicapValues: number[] = [];

  // Look for lines containing "HCP", "HDCP", or "HANDICAP"
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('hcp') ||
      lowerLine.includes('hdcp') ||
      lowerLine.includes('handicap') ||
      lowerLine.includes('m-hcp') ||
      lowerLine.includes('men')
    ) {
      // Extract numbers from this line (1-18)
      const numbers = line.match(/\b([1-9]|1[0-8])\b/g);
      if (numbers && numbers.length >= 9) {
        // Filter to only valid handicap values (1-18)
        const validNumbers = numbers.map(Number).filter((n) => n >= 1 && n <= 18);
        if (validNumbers.length >= 9) {
          handicapValues.push(...validNumbers.slice(0, 18));
        }
      }
    }
  }

  // If we found front 9 but not back 9, try to find them separately
  if (handicapValues.length === 9) {
    // Look for another set of 9 handicap values
    for (const line of lines) {
      if (handicapValues.length >= 18) break;
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes('hcp') ||
        lowerLine.includes('hdcp') ||
        lowerLine.includes('m-hcp')
      ) {
        const numbers = line.match(/\b([1-9]|1[0-8])\b/g);
        if (numbers && numbers.length >= 9) {
          const validNumbers = numbers.map(Number).filter((n) => n >= 1 && n <= 18);
          // Check if these are different from front 9
          const isDifferent = validNumbers.some((n) => !handicapValues.includes(n));
          if (isDifferent && validNumbers.length >= 9) {
            handicapValues.push(...validNumbers.slice(0, 9));
          }
        }
      }
    }
  }

  return handicapValues;
}

/**
 * Convert parsed tees to Tee type with IDs
 */
export function convertParsedTees(parsedTees: ParsedTee[]): Tee[] {
  return parsedTees.map((t) => ({
    id: generateId(),
    name: t.name,
    color: t.color,
    rating: t.rating,
    slope: t.slope,
    yardage: t.yardage,
  }));
}
