import { createContext, useContext, type ReactNode, type Dispatch, type SetStateAction } from "react"
import type { GameId } from "@/lib/game-types"

export type PendingNavigation = { target: GameId | null }

interface GameSessionContextValue {
  setInProgress: Dispatch<SetStateAction<boolean>>
  isExternallyPaused: boolean
}

const GameSessionContext = createContext<GameSessionContextValue>({
  setInProgress: () => {},
  isExternallyPaused: false,
})

export function useGameSession() {
  return useContext(GameSessionContext)
}

interface GameSessionProviderProps {
  children: ReactNode
  setInProgress: Dispatch<SetStateAction<boolean>>
  isExternallyPaused: boolean
}

export function GameSessionProvider({
  children,
  setInProgress,
  isExternallyPaused,
}: GameSessionProviderProps) {
  return (
    <GameSessionContext.Provider value={{ setInProgress, isExternallyPaused }}>
      {children}
    </GameSessionContext.Provider>
  )
}
