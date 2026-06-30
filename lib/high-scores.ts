import type { GameId } from "@/lib/game-types"

const STORAGE_KEY = "blitzzone-high-scores"

type HighScores = Record<GameId, number>

const DEFAULT_SCORES: HighScores = {
  "word-blitz": 0,
  "speed-sudoku": 0,
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function getHighScores(): HighScores {
  if (!isBrowser()) return { ...DEFAULT_SCORES }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SCORES }
    return { ...DEFAULT_SCORES, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SCORES }
  }
}

export function getHighScore(gameId: GameId): number {
  return getHighScores()[gameId] ?? 0
}

export interface SaveHighScoreResult {
  isNewRecord: boolean
  highScore: number
}

export function saveHighScore(gameId: GameId, score: number): SaveHighScoreResult {
  if (!isBrowser()) {
    return { isNewRecord: false, highScore: score }
  }

  const current = getHighScore(gameId)
  if (score > current) {
    const all = getHighScores()
    all[gameId] = score
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return { isNewRecord: true, highScore: score }
  }

  return { isNewRecord: false, highScore: current }
}

export function clearHighScores(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY)
}
