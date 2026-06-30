import { describe, it, expect, beforeEach, vi } from "vitest"
import { getHighScore, saveHighScore, clearHighScores } from "@/lib/high-scores"

describe("high-scores", () => {
  const storage: Record<string, string> = {}

  beforeEach(() => {
    Object.keys(storage).forEach((k) => delete storage[k])
    vi.stubGlobal("localStorage", {
      getItem(key: string) {
        return storage[key] ?? null
      },
      setItem(key: string, value: string) {
        storage[key] = value
      },
      removeItem(key: string) {
        delete storage[key]
      },
    })
    clearHighScores()
  })

  it("returns 0 when no score is stored", () => {
    expect(getHighScore("word-blitz")).toBe(0)
  })

  it("saves a new personal best", () => {
    const result = saveHighScore("word-blitz", 500)
    expect(result.isNewRecord).toBe(true)
    expect(result.highScore).toBe(500)
    expect(getHighScore("word-blitz")).toBe(500)
  })

  it("does not overwrite a higher existing score", () => {
    saveHighScore("speed-sudoku", 300)
    const result = saveHighScore("speed-sudoku", 200)
    expect(result.isNewRecord).toBe(false)
    expect(result.highScore).toBe(300)
  })
})
