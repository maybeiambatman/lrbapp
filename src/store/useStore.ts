import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Trip, Course, RoundScore, TripPlayer, TeeTime, Prize } from '../types';

interface AppStore {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Trips
  trips: Trip[];
  currentTrip: Trip | null;
  addTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  getTripByCode: (code: string) => Trip | undefined;

  // Players
  addPlayerToTrip: (tripId: string, player: TripPlayer) => void;
  updatePlayerInTrip: (tripId: string, playerId: string, updates: Partial<TripPlayer>) => void;
  removePlayerFromTrip: (tripId: string, playerId: string) => void;

  // Courses
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  getCourse: (courseId: string) => Course | undefined;

  // Tee Times
  addTeeTime: (tripId: string, teeTime: TeeTime) => void;
  updateTeeTime: (tripId: string, teeTimeId: string, updates: Partial<TeeTime>) => void;
  removeTeeTime: (tripId: string, teeTimeId: string) => void;

  // Prizes
  updatePrizes: (tripId: string, prizes: Prize[]) => void;
  awardPrize: (tripId: string, prizeId: string, winnerId: string) => void;

  // Scores
  scores: RoundScore[];
  addScore: (score: RoundScore) => void;
  updateScore: (scoreId: string, updates: Partial<RoundScore>) => void;
  getPlayerScores: (tripId: string, playerId: string) => RoundScore[];
  getRoundScores: (tripId: string, roundNumber: number) => RoundScore[];

  // Admins
  admins: string[];
  addAdmin: (email: string) => void;
  removeAdmin: (email: string) => void;
  isAdmin: (email: string) => boolean;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User state
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Trips
      trips: [],
      currentTrip: null,
      addTrip: (trip) => set((state) => ({
        trips: [...state.trips, trip]
      })),
      updateTrip: (tripId, updates) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, ...updates } : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? { ...state.currentTrip, ...updates }
          : state.currentTrip
      })),
      deleteTrip: (tripId) => set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        scores: state.scores.filter((s) => s.tripId !== tripId)
      })),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      getTripByCode: (code) => get().trips.find((t) => t.code.toLowerCase() === code.toLowerCase()),

      // Players
      addPlayerToTrip: (tripId, player) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                players: [...t.players, player],
                purseTotal: t.purseTotal + player.buyIn
              }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              players: [...state.currentTrip.players, player],
              purseTotal: state.currentTrip.purseTotal + player.buyIn
            }
          : state.currentTrip
      })),
      updatePlayerInTrip: (tripId, playerId, updates) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                players: t.players.map((p) =>
                  p.id === playerId ? { ...p, ...updates } : p
                )
              }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              players: state.currentTrip.players.map((p) =>
                p.id === playerId ? { ...p, ...updates } : p
              )
            }
          : state.currentTrip
      })),
      removePlayerFromTrip: (tripId, playerId) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId);
        const player = trip?.players.find(p => p.id === playerId);
        return {
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  players: t.players.filter((p) => p.id !== playerId),
                  purseTotal: t.purseTotal - (player?.buyIn || 0)
                }
              : t
          ),
          currentTrip: state.currentTrip?.id === tripId
            ? {
                ...state.currentTrip,
                players: state.currentTrip.players.filter((p) => p.id !== playerId),
                purseTotal: state.currentTrip.purseTotal - (player?.buyIn || 0)
              }
            : state.currentTrip
        };
      }),

      // Courses
      courses: [],
      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),
      updateCourse: (courseId, updates) => set((state) => ({
        courses: state.courses.map((c) =>
          c.id === courseId ? { ...c, ...updates } : c
        )
      })),
      deleteCourse: (courseId) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== courseId)
      })),
      getCourse: (courseId) => get().courses.find((c) => c.id === courseId),

      // Tee Times
      addTeeTime: (tripId, teeTime) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? { ...t, teeTimes: [...t.teeTimes, teeTime] }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? { ...state.currentTrip, teeTimes: [...state.currentTrip.teeTimes, teeTime] }
          : state.currentTrip
      })),
      updateTeeTime: (tripId, teeTimeId, updates) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                teeTimes: t.teeTimes.map((tt) =>
                  tt.id === teeTimeId ? { ...tt, ...updates } : tt
                )
              }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              teeTimes: state.currentTrip.teeTimes.map((tt) =>
                tt.id === teeTimeId ? { ...tt, ...updates } : tt
              )
            }
          : state.currentTrip
      })),
      removeTeeTime: (tripId, teeTimeId) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? { ...t, teeTimes: t.teeTimes.filter((tt) => tt.id !== teeTimeId) }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? { ...state.currentTrip, teeTimes: state.currentTrip.teeTimes.filter((tt) => tt.id !== teeTimeId) }
          : state.currentTrip
      })),

      // Prizes
      updatePrizes: (tripId, prizes) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, prizes } : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? { ...state.currentTrip, prizes }
          : state.currentTrip
      })),
      awardPrize: (tripId, prizeId, winnerId) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                prizes: t.prizes.map((p) =>
                  p.id === prizeId ? { ...p, winnerId } : p
                )
              }
            : t
        ),
        currentTrip: state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              prizes: state.currentTrip.prizes.map((p) =>
                p.id === prizeId ? { ...p, winnerId } : p
              )
            }
          : state.currentTrip
      })),

      // Scores
      scores: [],
      addScore: (score) => set((state) => ({
        scores: [...state.scores, score]
      })),
      updateScore: (scoreId, updates) => set((state) => ({
        scores: state.scores.map((s) =>
          s.id === scoreId ? { ...s, ...updates } : s
        )
      })),
      getPlayerScores: (tripId, playerId) =>
        get().scores.filter((s) => s.tripId === tripId && s.playerId === playerId),
      getRoundScores: (tripId, roundNumber) =>
        get().scores.filter((s) => s.tripId === tripId && s.roundNumber === roundNumber),

      // Admins
      admins: ['admin@golf.com'],
      addAdmin: (email) => set((state) => ({
        admins: [...state.admins, email.toLowerCase()]
      })),
      removeAdmin: (email) => set((state) => ({
        admins: state.admins.filter((a) => a !== email.toLowerCase())
      })),
      isAdmin: (email) => get().admins.includes(email.toLowerCase()),
    }),
    {
      name: 'golf-trip-storage',
    }
  )
);
