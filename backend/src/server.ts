import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tripRoutes } from './routes/trips.js';
import { courseRoutes } from './routes/courses.js';
import { scoreRoutes } from './routes/scores.js';
import { userRoutes } from './routes/users.js';
import gameRoutes from './routes/games.js';
import matchRoutes from './routes/matches.js';
import teamRoutes from './routes/teams.js';
import communityRoutes from './routes/communities.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/communities', communityRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
