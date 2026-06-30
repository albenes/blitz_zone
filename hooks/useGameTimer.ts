import { useState, useEffect, useCallback } from "react"

interface UseGameTimerOptions {
  duration: number
  isActive: boolean
  onTimeUp?: () => void
}

export function useGameTimer({ duration, isActive, onTimeUp }: UseGameTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (timeLeft === 0 && isActive) {
      onTimeUp?.()
    }
  }, [timeLeft, isActive, onTimeUp])

  const reset = useCallback((newDuration = duration) => {
    setTimeLeft(newDuration)
  }, [duration])

  const penalize = useCallback((seconds: number) => {
    setTimeLeft((t) => Math.max(0, t - seconds))
  }, [])

  const formattedTime = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`

  return { timeLeft, setTimeLeft, reset, penalize, formattedTime }
}
