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

  it("calls onTimeUp exactly once when timer reaches zero", () => {
    const onTimeUp = vi.fn()
    const { result, rerender } = renderHook(
      ({ onTimeUp }) => useGameTimer({ duration: 2, isActive: true, onTimeUp }),
      { initialProps: { onTimeUp } }
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

    // Simulate callback identity change (previous bug trigger)
    const newOnTimeUp = vi.fn()
    rerender({ onTimeUp: newOnTimeUp })
    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(newOnTimeUp).toHaveBeenCalledTimes(0)
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

  it("ignores invalid penalty values", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 10, isActive: false })
    )

    act(() => {
      result.current.penalize(NaN)
      result.current.penalize(-3)
      result.current.penalize(0)
    })
    expect(result.current.timeLeft).toBe(10)
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

  it("allows onTimeUp again after reset", () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() =>
      useGameTimer({ duration: 1, isActive: true, onTimeUp })
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onTimeUp).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.reset(1)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onTimeUp).toHaveBeenCalledTimes(2)
  })

  it("formats time with leading zero on seconds", () => {
    const { result } = renderHook(() =>
      useGameTimer({ duration: 65, isActive: false })
    )
    expect(result.current.formattedTime).toBe("1:05")
  })
})
