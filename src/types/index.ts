// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  isAdmin: boolean;
  createdAt: number;
}

// Course and hole information
export interface Hole {
  number: number;
  par: number;
  handicapRank: number; // 1-18, used to determine stroke allocation
  yards?: number;
}

export interface Tee {
  id: string;
  name: string; // e.g., "Gold", "Green", "White", "Blue"
  color?: string; // CSS color for display
  rating: number;
  slope: number;
  yardage?: number; // Total yardage from this tee
}

export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  tees: Tee[]; // Multiple tees with different ratings
  // Legacy fields for backwards compatibility
  rating?: number;
  slope?: number;
  createdBy: string;
  createdAt: number;
}

// Trip and round management
export interface TripPlayer {
  id: string;
  name: string;
  handicap: number;
  buyIn: number;
  joinedAt: number;
}

export interface TeeTime {
  id: string;
  roundNumber: number;
  time: string; // e.g., "8:00 AM"
  playerIds: string[];
}

export interface Prize {
  id: string;
  name: string;
  type: 'closest_to_pin' | 'best_net_round' | 'best_cumulative_net' | 'custom';
  roundNumber?: number; // For per-round prizes
  ctpHole?: number; // Which hole is CTP for this prize
  amount: number;
  winnerId?: string;
}

export interface Trip {
  id: string;
  name: string;
  code: string; // Unique code for joining
  startDate: string;
  endDate: string;
  buyInAmount: number;
  numberOfRounds: number;
  players: TripPlayer[];
  courses: string[]; // Course IDs for each round
  teeTimes: TeeTime[];
  prizes: Prize[];
  purseTotal: number;
  createdBy: string;
  createdAt: number;
  isActive: boolean;
}

// Score tracking
export interface HoleScore {
  holeNumber: number;
  grossScore: number;
  netScore: number;
  strokesReceived: number;
}

export interface RoundScore {
  id: string;
  tripId: string;
  playerId: string;
  playerName: string;
  roundNumber: number;
  courseId: string;
  handicap: number;
  holes: HoleScore[];
  grossTotal: number;
  netTotal: number;
  isComplete: boolean;
  closestToPin?: {
    holeNumber: number;
    distance: string; // e.g., "4'6\""
  };
  updatedAt: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  handicap: number;
  rounds: {
    roundNumber: number;
    grossScore: number;
    netScore: number;
    isComplete: boolean;
  }[];
  totalGross: number;
  totalNet: number;
  roundsCompleted: number;
  position: number;
}

export interface PurseEntry {
  playerId: string;
  playerName: string;
  prizes: {
    prizeName: string;
    amount: number;
  }[];
  totalWinnings: number;
  netPosition: number; // Final standing including buy-in
}

// App state
export interface AppState {
  currentUser: User | null;
  currentTrip: Trip | null;
  isLoading: boolean;
}
