# Golf Trip Manager

A comprehensive web application for managing golf trips, including player rosters, tee times, scoring, leaderboards, and prize purses.

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   
   - **In a dev container or Docker**: Use the `--host` flag to expose the server:
     ```bash
     npm run dev -- --host
     ```
   
   - **Local development**: Standard command works fine:
     ```bash
     npm run dev
     ```

3. **Access the application**:
   - Local: http://localhost:5173/
   - Container: VS Code will auto-forward port 5173 (check the "Ports" tab)

The dev server includes Hot Module Replacement (HMR), so changes will automatically reload in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

This application is built with:

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with HMR
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Firebase** - Backend services (planned)
- **Tesseract.js** - OCR for scorecard parsing

## Project Structure

```
src/
├── components/
│   └── common/        # Reusable UI components (Button, Card, Input, etc.)
├── config/            # Configuration files (Firebase, etc.)
├── pages/             # Page components
│   ├── admin/         # Admin dashboard, course/trip management
│   └── user/          # User-facing pages (leaderboard, scoring, etc.)
├── store/             # Zustand store for state management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions (handicap, leaderboard, OCR parsing)
```

## Important Notes for Development

### Container/Codespace Development
When running in a dev container or GitHub Codespace, **always use the `--host` flag** with the dev server:
```bash
npm run dev -- --host
```
This ensures Vite binds to `0.0.0.0` instead of just `localhost`, allowing proper port forwarding.

### Port Forwarding
- Port 5173 should automatically forward in VS Code
- Check the "Ports" tab (next to Terminal) if you can't access the app
- Click the globe icon or local address to open in your browser

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
