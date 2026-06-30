import type { GameId } from "@/lib/game-types"

const STORAGE_KEY = "blitzzone-high-scores"

type HighScores = Record<GameId, number>

const DEFAULT_SCORES: HighScores = {
  "word-blitz": 0,
  "speed-sudoku": 0,
}

const VALID_GAME_IDS = Object.keys(DEFAULT_SCORES) as GameId[]

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function sanitizeScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null
  }
  return Math.floor(value)
}

/** Only accepts known game IDs and finite non-negative integers. */
export function sanitizeHighScores(data: unknown): HighScores {
  const result = { ...DEFAULT_SCORES }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return result
  }

  const record = data as Record<string, unknown>
  for (const gameId of VALID_GAME_IDS) {
    const score = sanitizeScore(record[gameId])
    if (score !== null) {
      result[gameId] = score
    }
  }

  return result
}

export function getHighScores(): HighScores {
  if (!isBrowser()) return { ...DEFAULT_SCORES }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SCORES }
    return sanitizeHighScores(JSON.parse(raw))
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
  const sanitized = sanitizeScore(score)
  if (sanitized === null) {
    return { isNewRecord: false, highScore: getHighScore(gameId) }
  }

  if (!isBrowser()) {
    return { isNewRecord: false, highScore: sanitized }
  }

  const current = getHighScore(gameId)
  if (sanitized > current) {
    const all = getHighScores()
    all[gameId] = sanitized
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return { isNewRecord: true, highScore: sanitized }
  }

  return { isNewRecord: false, highScore: current }
}

export function clearHighScores(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY)
}
