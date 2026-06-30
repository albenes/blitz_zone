import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useGameTimer } from "@/hooks/useGameTimer"

describe("useGameTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("counts down when active", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 10, isActive: true })
    )

    expect(result.current.timeLeft).toBe(10)
    expect(result.current.formattedTime).toBe("0:10")

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.timeLeft).toBe(9)
  })

  it("does not count down when inactive", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 10, isActive: false })
    )

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.timeLeft).toBe(10)
  })

  it("calls onTimeUp when timer reaches zero", () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() =>
      useGameTimer({ duration: 2, isActive: true, onTimeUp })
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.timeLeft).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.timeLeft).toBe(0)
    expect(onTimeUp).toHaveBeenCalledTimes(1)
  })

  it("applies penalty without going below zero", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 3, isActive: false })
    )

    act(() => {
      result.current.penalize(5)
    })
    expect(result.current.timeLeft).toBe(0)
  })

  it("resets to the given duration", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 10, isActive: false })
    )

    act(() => {
      result.current.penalize(3)
      result.current.reset(90)
    })
    expect(result.current.timeLeft).toBe(90)
    expect(result.current.formattedTime).toBe("1:30")
  })
})
