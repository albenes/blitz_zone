import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

export type GameId = "word-blitz" | "speed-sudoku"

export type GameState = "idle" | "playing" | "paused" | "summary"

export interface GameDefinition {
  id: GameId
  name: string
  description: string
  duration: string
  icon: LucideIcon
  component: ComponentType
}

export interface GameSummaryStat {
  label: string
  value: string | number
}
