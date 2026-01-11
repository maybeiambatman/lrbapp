# Golf Trip Manager

A production-ready full-stack web application for managing golf trips with player rosters, tee times, live scoring, leaderboards, and prize purses.

## Architecture

**Monorepo Structure:**
- `backend/` - Express API with Prisma ORM and PostgreSQL
- `src/` - React frontend with TypeScript and Vite
- `docker-compose.yml` - Full-stack development environment

## Quick Start

### Option 1: Docker Compose (Recommended)

Start all services (PostgreSQL, Backend API, Frontend):

```bash
docker-compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev -- --host
```

## Development

### Database Management

```bash
cd backend

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

**Seed Data:**
- Admin: `admin@golf.com`
- Sample Trip Code: `MSTR26`
- 4 test players with Augusta National course

**Seed Data:**
- Admin: `admin@golf.com`
- Sample Trip Code: `MSTR26`
- 4 test players with Augusta National course

### Tech Stack

**Backend:**
- Express.js - REST API
- Prisma - ORM with migrations
- PostgreSQL - Database
- TypeScript - Type safety

**Frontend:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Build tool with HMR
- Tailwind CSS 4 - Styling
- Zustand - State management (migrating to API)
- React Router - Navigation

### Container Development

When running in a dev container/Codespace, use the `--host` flag:

```bash
npm run dev -- --host
```

This ensures Vite binds to `0.0.0.0` for proper port forwarding.

## Project Structure

```
├── backend/              # API Server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Error handling, etc.
│   │   └── server.ts     # Express app
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   ├── migrations/   # Schema versions
│   │   └── seed.ts       # Test data
│   └── package.json
├── src/                  # React Frontend
│   ├── components/
│   ├── pages/
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── utils/
├── docker-compose.yml    # Full-stack dev environment
└── README.md
```

## API Documentation

See [backend/README.md](backend/README.md) for full API documentation.

**Key Endpoints:**
- `GET /api/trips/code/:code` - Join trip by code
- `GET /api/courses` - List courses
- `POST /api/scores` - Submit scores
- `GET /api/scores/trip/:id` - Leaderboard data

## Database Schema

Key entities:
- **User** - Admin users
- **Trip** - Golf trip with code, dates, buy-in
- **TripPlayer** - Players on a trip
- **Course** - Golf courses with holes and tees
- **RoundScore** - Player scores per round
- **Prize** - Prize pool allocations

See [backend/prisma/schema.prisma](backend/prisma/schema.prisma) for full schema.

## Deployment

### Backend

```bash
cd backend
npm run build
DATABASE_URL="postgresql://..." npm start
```

### Frontend

```bash
npm run build
npm run preview
```

## Contributing

See [.github/AGENT.md](.github/AGENT.md) for development guidelines.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
