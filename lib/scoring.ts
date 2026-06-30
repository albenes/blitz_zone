/** Word Blitz scoring: base points + remaining seconds per correct word. */
export const WORD_BLITZ_CONFIG = {
  DURATION_SECONDS: 120,
  MAX_ATTEMPTS: 6,
  WORD_LENGTH: 5,
  BASE_SCORE_PER_WORD: 100,
} as const

/** Speed Sudoku scoring: remaining seconds per completed subgrid; penalty on wrong submit. */
export const SPEED_SUDOKU_CONFIG = {
  DURATION_SECONDS: 90,
  PENALTY_SECONDS: 5,
} as const

/**
 * Word Blitz: each correct word awards BASE + time remaining.
 * Example: guess at 1:45 remaining → 100 + 105 = 205 points.
 */
export function calcWordBlitzWordScore(timeLeftSeconds: number): number {
  return WORD_BLITZ_CONFIG.BASE_SCORE_PER_WORD + timeLeftSeconds
}

/**
 * Speed Sudoku: each correct subgrid awards the seconds left on the clock.
 * Example: complete at 0:42 → 42 points.
 */
export function calcSudokuSubgridScore(timeLeftSeconds: number): number {
  if (!Number.isFinite(timeLeftSeconds)) return 0
  return Math.max(0, timeLeftSeconds)
}

export function formatScoreBreakdown(game: "word-blitz" | "speed-sudoku"): string {
  if (game === "word-blitz") {
    return `${WORD_BLITZ_CONFIG.BASE_SCORE_PER_WORD} base + seconds remaining per word`
  }
  return "seconds remaining per completed subgrid"
}
