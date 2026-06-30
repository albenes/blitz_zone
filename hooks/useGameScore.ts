import { useState, useCallback } from "react"

export function useGameScore() {
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const addScore = useCallback((points: number) => {
    setScore((s) => s + points)
  }, [])

  const incrementStreak = useCallback(() => {
    setStreak((s) => s + 1)
  }, [])

  const reset = useCallback(() => {
    setScore(0)
    setStreak(0)
  }, [])

  return { score, streak, addScore, incrementStreak, reset, setScore, setStreak }
}
