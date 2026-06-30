# BlitzZone

Fast-paced mini-games built with Next.js. Guess words against the clock, solve sudoku subgrids, and chase your personal best.

## Games

| Game | Duration | Scoring |
|------|----------|---------|
| **Word Blitz** | 2 minutes | `100 + seconds remaining` per correct word |
| **Speed Sudoku** | 90 seconds | `seconds remaining` per completed subgrid (−5s penalty on wrong submit) |

High scores are saved locally in your browser (`localStorage`).

## Tech Stack

- **Next.js 14** (Pages Router)
- **React 18** + TypeScript
- **Tailwind CSS** + Framer Motion
- **Vitest** for unit tests

## Project Structure

```
components/
  game/       Shared game UI (HUD, summary modal, letter tiles)
  layout/     App shell, header, footer, home hub
games/
  word-blitz/
  speed-sudoku/
  registry.tsx
hooks/        useGameTimer, useGameScore, useGameState, useHighScore
lib/          Game logic, scoring, sudoku, evaluate-guess
contexts/     Game session (pause on navigation)
pages/        Next.js routes
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |

## Testing

Tests cover core game logic:

- `lib/evaluate-guess.test.ts` — Wordle-style letter evaluation
- `lib/sudoku.test.ts` — Puzzle generation and validation
- `lib/scoring.test.ts` — Score formulas
- `lib/high-scores.test.ts` — Personal best persistence
- `hooks/useGameTimer.test.ts` — Countdown and penalty behavior

## Scoring Reference

Scoring constants live in `lib/scoring.ts`:

```ts
// Word Blitz: 100 base + time left when word is guessed
calcWordBlitzWordScore(timeLeft) // e.g. 100 + 105 = 205

// Speed Sudoku: time left when subgrid is completed
calcSudokuSubgridScore(timeLeft) // e.g. 42
```

## Roadmap

- [x] Architecture refactor and shared components
- [x] Game logic fixes (Sudoku validation, Word Blitz blitz mode)
- [x] UX polish, landing hub, responsive layout
- [x] Unit tests, CI, high scores
- [ ] New games: Memory Match, Color Match, Math Challenge, Anagram Solver

## License

Private project.
