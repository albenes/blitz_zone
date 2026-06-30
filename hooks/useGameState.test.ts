import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useGameState } from "@/hooks/useGameState"

describe("useGameState", () => {
  it("starts in idle by default", () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.isIdle).toBe(true)
    expect(result.current.isTimerActive).toBe(false)
  })

  it("transitions idle → playing → summary", () => {
    const { result } = renderHook(() => useGameState())

    act(() => result.current.start())
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.isTimerActive).toBe(true)

    act(() => result.current.end())
    expect(result.current.isSummary).toBe(true)
    expect(result.current.isTimerActive).toBe(false)
  })

  it("supports pause and resume", () => {
    const { result } = renderHook(() => useGameState())

    act(() => result.current.start())
    act(() => result.current.pause())
    expect(result.current.isPaused).toBe(true)
    expect(result.current.isTimerActive).toBe(false)

    act(() => result.current.resume())
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.isTimerActive).toBe(true)
  })

  it("does not pause from idle or summary", () => {
    const { result } = renderHook(() => useGameState())

    act(() => result.current.pause())
    expect(result.current.isIdle).toBe(true)

    act(() => result.current.start())
    act(() => result.current.end())
    act(() => result.current.pause())
    expect(result.current.isSummary).toBe(true)
  })

  it("resets to idle with toIdle", () => {
    const { result } = renderHook(() => useGameState())

    act(() => result.current.start())
    act(() => result.current.toIdle())
    expect(result.current.isIdle).toBe(true)
  })
})
