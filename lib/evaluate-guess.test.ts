import { describe, it, expect } from "vitest"
import { evaluateGuess, mergeLetterStates, letterResultToColor } from "@/lib/evaluate-guess"

describe("evaluateGuess", () => {
  it("marks an exact match as all correct", () => {
    expect(evaluateGuess("APPLE", "APPLE")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ])
  })

  it("handles present letters in wrong positions", () => {
    expect(evaluateGuess("CRANE", "CRATE")).toEqual([
      "correct",
      "correct",
      "correct",
      "absent",
      "correct",
    ])
  })

  it("does not over-count duplicate letters", () => {
    expect(evaluateGuess("ROOFS", "ROBOT")).toEqual([
      "correct",
      "correct",
      "present",
      "absent",
      "absent",
    ])
  })

  it("marks all absent when no letters match", () => {
    expect(evaluateGuess("XYZZY", "APPLE")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ])
  })

  it("returns all absent when lengths differ", () => {
    expect(evaluateGuess("HELLO", "HI")).toEqual(["absent", "absent", "absent", "absent", "absent"])
    expect(evaluateGuess("HI", "HELLO")).toEqual(["absent", "absent", "absent", "absent", "absent"])
  })

  it("returns absent for empty strings", () => {
    expect(evaluateGuess("", "")).toEqual(["absent"])
  })

  it("handles classic Wordle case: SOARE vs ROAST", () => {
    expect(evaluateGuess("SOARE", "ROAST")).toEqual([
      "present",
      "correct",
      "correct",
      "present",
      "absent",
    ])
  })

  it("handles letters appearing twice in guess but once in target", () => {
    expect(evaluateGuess("SPEED", "SPARE")).toEqual([
      "correct",
      "correct",
      "present",
      "absent",
      "absent",
    ])
  })
})

describe("mergeLetterStates", () => {
  it("keeps the best known state per letter", () => {
    const merged = mergeLetterStates({ A: "absent" }, "ALERT", "APPLE")
    expect(merged.A).toBe("correct")
    expect(merged.L).toBe("present")
    expect(merged.E).toBe("present")
  })

  it("does not downgrade correct to present", () => {
    const merged = mergeLetterStates({ A: "correct" }, "ALONG", "APPLE")
    expect(merged.A).toBe("correct")
  })

  it("upgrades absent to present", () => {
    const merged = mergeLetterStates({ T: "absent" }, "TRACE", "CRATE")
    expect(merged.T).toBe("present")
  })
})

describe("letterResultToColor", () => {
  it("returns safe CSS classes without user input", () => {
    expect(letterResultToColor("correct")).toBe("bg-green-500")
    expect(letterResultToColor(undefined)).toBe("bg-opacity-20 bg-white")
  })
})
