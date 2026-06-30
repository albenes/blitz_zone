import { useState, useEffect, useCallback } from "react"
import type { GameId } from "@/lib/game-types"
import { getHighScore, saveHighScore } from "@/lib/high-scores"

export function useHighScore(gameId: GameId) {
  const [highScore, setHighScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  useEffect(() => {
    setHighScore(getHighScore(gameId))
  }, [gameId])

  const recordScore = useCallback(
    (score: number) => {
      const result = saveHighScore(gameId, score)
      setHighScore(result.highScore)
      setIsNewRecord(result.isNewRecord)
      return result
    },
    [gameId]
  )

  const resetRecordFlag = useCallback(() => {
    setIsNewRecord(false)
  }, [])

  return { highScore, isNewRecord, recordScore, resetRecordFlag }
}
