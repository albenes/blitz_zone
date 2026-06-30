import dynamic from "next/dynamic"
import { Zap, Clock } from "lucide-react"
import type { GameDefinition, GameId } from "@/lib/game-types"
import { GameLoading } from "@/components/game/GameLoading"

const WordBlitz = dynamic(() => import("@/games/word-blitz"), {
  loading: () => <GameLoading />,
})

const SpeedSudoku = dynamic(() => import("@/games/speed-sudoku"), {
  loading: () => <GameLoading />,
})

export const games: GameDefinition[] = [
  { id: "word-blitz", name: "Word Blitz", icon: Zap, component: WordBlitz },
  { id: "speed-sudoku", name: "Speed Sudoku", icon: Clock, component: SpeedSudoku },
]

export const defaultGameId: GameId = "word-blitz"

export function getGameById(id: GameId): GameDefinition {
  const game = games.find((g) => g.id === id)
  if (!game) throw new Error(`Game not found: ${id}`)
  return game
}
