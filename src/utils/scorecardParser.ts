import Tesseract from 'tesseract.js';
import type { Hole } from '../types';

export interface ParsedScorecard {
  courseName?: string;
  rating?: number;
  slope?: number;
  holes: Hole[];
  confidence: number;
  rawText: string;
}

interface ParseProgress {
  status: string;
  progress: number;
}

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

  // Try to find course rating and slope
  let rating: number | undefined;
  let slope: number | undefined;

  const ratingMatch = text.match(/rating[:\s]+(\d+\.?\d*)/i);
  if (ratingMatch) {
    rating = parseFloat(ratingMatch[1]);
  }

  const slopeMatch = text.match(/slope[:\s]+(\d+)/i);
  if (slopeMatch) {
    slope = parseInt(slopeMatch[1]);
  }

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
  const handicapValues = extractHandicapValues(text, lines);
  if (handicapValues.length >= 9) {
    handicapValues.forEach((hcp, i) => {
      if (i < 18 && hcp >= 1 && hcp <= 18) {
        holes[i].handicapRank = hcp;
      }
    });
  }

  return {
    courseName,
    rating,
    slope,
    holes,
  };
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
function extractHandicapValues(_text: string, lines: string[]): number[] {
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
