import { useState, useCallback } from "react"
import type { GameState } from "@/lib/game-types"

export function useGameState(initial: GameState = "idle") {
  const [state, setState] = useState<GameState>(initial)

  const start = useCallback(() => setState("playing"), [])
  const pause = useCallback(() => setState((s) => (s === "playing" ? "paused" : s)), [])
  const resume = useCallback(() => setState((s) => (s === "paused" ? "playing" : s)), [])
  const end = useCallback(() => setState("summary"), [])
  const toIdle = useCallback(() => setState("idle"), [])

  return {
    state,
    setState,
    start,
    pause,
    resume,
    end,
    toIdle,
    isIdle: state === "idle",
    isPlaying: state === "playing",
    isPaused: state === "paused",
    isSummary: state === "summary",
    isTimerActive: state === "playing",
  }
}
