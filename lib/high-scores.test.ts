import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  getHighScore,
  saveHighScore,
  clearHighScores,
  getHighScores,
  sanitizeHighScores,
} from "@/lib/high-scores"

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

  it("rejects negative scores", () => {
    const result = saveHighScore("word-blitz", -100)
    expect(result.isNewRecord).toBe(false)
    expect(getHighScore("word-blitz")).toBe(0)
  })

  it("rejects NaN and Infinity", () => {
    expect(saveHighScore("word-blitz", NaN).isNewRecord).toBe(false)
    expect(saveHighScore("word-blitz", Infinity).isNewRecord).toBe(false)
    expect(getHighScore("word-blitz")).toBe(0)
  })

  it("floors decimal scores", () => {
    const result = saveHighScore("word-blitz", 99.9)
    expect(result.highScore).toBe(99)
  })

  it("ignores unknown keys from corrupted localStorage", () => {
    storage["blitzzone-high-scores"] = JSON.stringify({
      "word-blitz": 100,
      "speed-sudoku": 50,
      "__proto__": { polluted: true },
      "evil-game": 9999,
      "constructor": { prototype: { hacked: true } },
    })
    const scores = getHighScores()
    expect(scores["word-blitz"]).toBe(100)
    expect(scores["speed-sudoku"]).toBe(50)
    expect(Object.keys(scores)).toEqual(["word-blitz", "speed-sudoku"])
    expect((scores as Record<string, unknown>)["evil-game"]).toBeUndefined()
  })

  it("rejects non-numeric values in stored data", () => {
    storage["blitzzone-high-scores"] = JSON.stringify({
      "word-blitz": "999",
      "speed-sudoku": null,
    })
    expect(getHighScores()).toEqual({ "word-blitz": 0, "speed-sudoku": 0 })
  })

  it("handles malformed JSON safely", () => {
    storage["blitzzone-high-scores"] = "{not valid json"
    expect(getHighScores()).toEqual({ "word-blitz": 0, "speed-sudoku": 0 })
  })

  it("handles prototype pollution payload in JSON.parse", () => {
    const malicious = '{"word-blitz":100,"__proto__":{"admin":true}}'
    storage["blitzzone-high-scores"] = malicious
    const scores = getHighScores()
    expect(scores["word-blitz"]).toBe(100)
    expect((Object.prototype as Record<string, unknown>).admin).toBeUndefined()
  })
})

describe("sanitizeHighScores", () => {
  it("returns defaults for non-object input", () => {
    expect(sanitizeHighScores(null)).toEqual({ "word-blitz": 0, "speed-sudoku": 0 })
    expect(sanitizeHighScores("string")).toEqual({ "word-blitz": 0, "speed-sudoku": 0 })
    expect(sanitizeHighScores([])).toEqual({ "word-blitz": 0, "speed-sudoku": 0 })
  })
})
