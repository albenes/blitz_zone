import { useState, useEffect, useCallback, useRef } from "react"

interface UseGameTimerOptions {
  duration: number
  isActive: boolean
  onTimeUp?: () => void
}

export function useGameTimer({ duration, isActive, onTimeUp }: UseGameTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const onTimeUpRef = useRef(onTimeUp)
  const hasCalledTimeUpRef = useRef(false)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    if (timeLeft > 0) {
      hasCalledTimeUpRef.current = false
    }
  }, [timeLeft])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (timeLeft === 0 && isActive && !hasCalledTimeUpRef.current) {
      hasCalledTimeUpRef.current = true
      onTimeUpRef.current?.()
    }
  }, [timeLeft, isActive])

  const reset = useCallback((newDuration = duration) => {
    hasCalledTimeUpRef.current = false
    setTimeLeft(newDuration)
  }, [duration])

  const penalize = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return
    setTimeLeft((t) => Math.max(0, t - seconds))
  }, [])

  const formattedTime = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`

  return { timeLeft, setTimeLeft, reset, penalize, formattedTime }
}
