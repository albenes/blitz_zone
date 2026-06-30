import { describe, it, expect } from "vitest"
import wordList from "@/public/words.json"
import {
  calcWordBlitzWordScore,
  calcSudokuSubgridScore,
  WORD_BLITZ_CONFIG,
  SPEED_SUDOKU_CONFIG,
} from "@/lib/scoring"

const WORD_LENGTH = 5
const VALID_WORD_PATTERN = /^[a-z]{5}$/

describe("words.json integrity", () => {
  const words: string[] = wordList.words

  it("is a non-empty array", () => {
    expect(Array.isArray(words)).toBe(true)
    expect(words.length).toBeGreaterThan(100)
  })

  it("contains only 5-letter lowercase a-z words", () => {
    const invalid = words.filter((w) => !VALID_WORD_PATTERN.test(w))
    expect(invalid).toEqual([])
  })

  it("has no duplicate entries", () => {
    const unique = new Set(words)
    expect(unique.size).toBe(words.length)
  })

  it("has no empty or whitespace entries", () => {
    expect(words.every((w) => w.trim().length === WORD_LENGTH)).toBe(true)
  })

  it("does not contain injection-like strings", () => {
    const dangerous = words.filter(
      (w) => w.includes("<") || w.includes(">") || w.includes("script") || w.includes('"')
    )
    expect(dangerous).toEqual([])
  })
})

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
    expect(calcSudokuSubgridScore(NaN)).toBe(0)
    expect(calcSudokuSubgridScore(Infinity)).toBe(0)
  })

  it("never awards negative Word Blitz points from time", () => {
    expect(calcWordBlitzWordScore(-10)).toBe(
      WORD_BLITZ_CONFIG.BASE_SCORE_PER_WORD - 10
    )
  })

  it("documents game durations", () => {
    expect(WORD_BLITZ_CONFIG.DURATION_SECONDS).toBe(120)
    expect(SPEED_SUDOKU_CONFIG.DURATION_SECONDS).toBe(90)
    expect(SPEED_SUDOKU_CONFIG.PENALTY_SECONDS).toBe(5)
  })

  it("max theoretical Word Blitz score per word is bounded", () => {
    const maxPerWord = calcWordBlitzWordScore(WORD_BLITZ_CONFIG.DURATION_SECONDS)
    expect(maxPerWord).toBe(WORD_BLITZ_CONFIG.BASE_SCORE_PER_WORD + 120)
  })
})
