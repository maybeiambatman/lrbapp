# Agent Instructions for Golf Trip Manager

## Recommended VS Code Extensions

### GitHub & Git Management
- **GitHub Pull Requests and Issues** (`GitHub.vscode-pull-request-github`) - Manage PRs and issues directly in VS Code
- **GitLens** (`eamodio.gitlens`) - Supercharge Git capabilities (blame, history, comparisons)
- **Git Graph** (`mhutchie.git-graph`) - Visual repository graph and commit history

### Code Quality
- **ESLint** (`dbaeumer.vscode-eslint`) - JavaScript/TypeScript linting
- **Prettier** (`esbenp.prettier-vscode`) - Code formatter
- **EditorConfig** (`editorconfig.editorconfig`) - Consistent coding styles

### Development Tools
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Autocomplete for Tailwind classes
- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`) - Code snippets
- **TypeScript Error Translator** (`mattpocock.ts-error-translator`) - Better TypeScript error messages

### Optional but Useful
- **Conventional Commits** (`vivaxy.vscode-conventional-commits`) - Enforce commit message standards
- **Error Lens** (`usernamehm.errorlens`) - Inline error highlighting
- **Import Cost** (`wix.vscode-import-cost`) - Display import/require package sizes

## Development Setup

### Starting the Dev Server

**IMPORTANT**: When running in a dev container, GitHub Codespace, or any containerized environment, you **MUST** use the `--host` flag:

```bash
npm run dev -- --host
```

This ensures Vite binds to `0.0.0.0` instead of `localhost`, enabling proper port forwarding.

### Port Access
- Default port: 5173
- VS Code will auto-forward the port in containers
- Check the "Ports" tab if the app isn't accessible
- Access via the forwarded URL provided by VS Code

## Project Overview

This is a golf trip management application built with React, TypeScript, Vite, and Tailwind CSS. It manages:
- Player rosters and handicaps
- Tee times and pairings
- Score entry and tracking
- Live leaderboards
- Prize purse distribution

## Key Technologies

- **React 19** with TypeScript
- **Vite 7** for build/dev tooling
- **Tailwind CSS 4** for styling
- **Zustand** for state management (with persist middleware)
- **React Router** for navigation
- **Firebase** for backend (authentication, Firestore)
- **Tesseract.js** for OCR scorecard parsing

## State Management

The app uses Zustand with localStorage persistence:
- Store location: `src/store/useStore.ts`
- Persisted to: `localStorage` under key `golf-trip-storage`
- Includes: users, trips, courses, scores, admins

## Important Patterns

### Protected Routes
- Admin routes require `currentUser.isAdmin = true`
- User routes require `currentUser` and `currentTrip`
- Redirect to home if unauthorized

### Admin Access
- Default admin: `admin@golf.com`
- Admins managed in store via `addAdmin()` and `removeAdmin()`

### Trip Codes
- Each trip has a unique alphanumeric code
- Players join trips using the code
- Case-insensitive matching

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (container)
npm run dev -- --host

# Start dev server (local)
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/` or appropriate subfolder
2. Export from `src/pages/index.ts`
3. Add route in `src/App.tsx`
4. Add navigation link if needed

### Adding a New Common Component
1. Create in `src/components/common/`
2. Export from `src/components/common/index.ts`
3. Import where needed

### Modifying State
- Update store types in `src/types/index.ts`
- Add/modify store actions in `src/store/useStore.ts`
- State persists automatically via Zustand middleware

## Styling

Uses Tailwind CSS 4 with a Masters Tournament-inspired color scheme:
- Primary green: `#006747` (Augusta National)
- Gold accents: `#d4af37`
- Custom CSS variables defined in `src/index.css`

## Firebase Configuration

Firebase config in `src/config/firebase.ts` uses environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Falls back to demo values if not set.

## Troubleshooting

### "Loading" screen that never resolves
- Ensure dev server is running with `--host` flag in containers
- Check browser console for errors (F12 → Console)
- Verify port 5173 is forwarded (VS Code Ports tab)
- Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Port already in use
```bash
# Kill existing Vite processes
pkill -f "vite"

# Restart with correct flags
npm run dev -- --host
```

### State persistence issues
- Clear localStorage: Browser DevTools → Application → Local Storage
- Key: `golf-trip-storage`
