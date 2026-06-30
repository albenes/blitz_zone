import { describe, it, expect } from "vitest"
import { games, getGameById } from "@/games/registry"
import type { GameId } from "@/lib/game-types"

describe("games registry", () => {
  it("registers all expected games", () => {
    const ids = games.map((g) => g.id)
    expect(ids).toContain("word-blitz")
    expect(ids).toContain("speed-sudoku")
    expect(games.length).toBe(2)
  })

  it("each game has required metadata", () => {
    for (const game of games) {
      expect(game.name.length).toBeGreaterThan(0)
      expect(game.description.length).toBeGreaterThan(10)
      expect(game.duration.length).toBeGreaterThan(0)
      expect(game.component).toBeDefined()
      expect(game.icon).toBeDefined()
    }
  })

  it("getGameById returns the correct game", () => {
    const game = getGameById("word-blitz")
    expect(game.name).toBe("Word Blitz")
  })

  it("getGameById throws for unknown id", () => {
    expect(() => getGameById("unknown" as GameId)).toThrow("Game not found")
  })

  it("has unique game ids", () => {
    const ids = games.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
