import { describe, it, expect } from "vitest"
import {
  calcWordBlitzWordScore,
  calcSudokuSubgridScore,
  WORD_BLITZ_CONFIG,
  SPEED_SUDOKU_CONFIG,
} from "@/lib/scoring"

describe("scoring", () => {
  it("calculates Word Blitz score as base + time left", () => {
    expect(calcWordBlitzWordScore(105)).toBe(
      WORD_BLITZ_CONFIG.BASE_SCORE_PER_WORD + 105
    )
  })

  it("calculates Sudoku score as remaining seconds", () => {
    expect(calcSudokuSubgridScore(42)).toBe(42)
  })

  it("never awards negative Sudoku points", () => {
    expect(calcSudokuSubgridScore(-5)).toBe(0)
  })

  it("documents game durations", () => {
    expect(WORD_BLITZ_CONFIG.DURATION_SECONDS).toBe(120)
    expect(SPEED_SUDOKU_CONFIG.DURATION_SECONDS).toBe(90)
    expect(SPEED_SUDOKU_CONFIG.PENALTY_SECONDS).toBe(5)
  })
})
