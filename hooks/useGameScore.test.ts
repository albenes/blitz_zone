import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useGameScore } from "@/hooks/useGameScore"

describe("useGameScore", () => {
  it("starts at zero", () => {
    const { result } = renderHook(() => useGameScore())
    expect(result.current.score).toBe(0)
    expect(result.current.streak).toBe(0)
  })

  it("accumulates score", () => {
    const { result } = renderHook(() => useGameScore())

    act(() => result.current.addScore(100))
    act(() => result.current.addScore(50))
    expect(result.current.score).toBe(150)
  })

  it("increments streak", () => {
    const { result } = renderHook(() => useGameScore())

    act(() => result.current.incrementStreak())
    act(() => result.current.incrementStreak())
    expect(result.current.streak).toBe(2)
  })

  it("resets score and streak", () => {
    const { result } = renderHook(() => useGameScore())

    act(() => {
      result.current.addScore(200)
      result.current.incrementStreak()
      result.current.reset()
    })
    expect(result.current.score).toBe(0)
    expect(result.current.streak).toBe(0)
  })

  it("allows manual streak reset without clearing score", () => {
    const { result } = renderHook(() => useGameScore())

    act(() => {
      result.current.addScore(100)
      result.current.incrementStreak()
      result.current.setStreak(0)
    })
    expect(result.current.score).toBe(100)
    expect(result.current.streak).toBe(0)
  })
})
