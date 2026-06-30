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
  {
    id: "word-blitz",
    name: "Word Blitz",
    description: "Guess as many 5-letter words as you can before time runs out.",
    duration: "2 min",
    icon: Zap,
    component: WordBlitz,
  },
  {
    id: "speed-sudoku",
    name: "Speed Sudoku",
    description: "Fill 3×3 subgrids as fast as you can. Speed and accuracy matter.",
    duration: "90 sec",
    icon: Clock,
    component: SpeedSudoku,
  },
]

export function getGameById(id: GameId): GameDefinition {
  const game = games.find((g) => g.id === id)
  if (!game) throw new Error(`Game not found: ${id}`)
  return game
}
