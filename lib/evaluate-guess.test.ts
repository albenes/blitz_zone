import { describe, it, expect } from "vitest"
import { evaluateGuess, mergeLetterStates } from "@/lib/evaluate-guess"

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
})
