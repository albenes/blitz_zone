import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HomeHub } from "@/components/layout/HomeHub"
import { NavigationConfirmModal } from "@/components/game/NavigationConfirmModal"
import { GameSessionProvider, type PendingNavigation } from "@/contexts/GameSessionContext"
import { games, getGameById } from "@/games/registry"
import type { GameId } from "@/lib/game-types"

export default function BlitzZoneLayout() {
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [pendingNav, setPendingNav] = useState<PendingNavigation | null>(null)

  const isExternallyPaused = pendingNav !== null

  const navigateTo = useCallback(
    (target: GameId | null) => {
      if (inProgress && target !== activeGameId) {
        setPendingNav({ target })
        return
      }
      setActiveGameId(target)
    },
    [inProgress, activeGameId]
  )

  const handleConfirmNav = () => {
    if (pendingNav) {
      setActiveGameId(pendingNav.target)
      setPendingNav(null)
      setInProgress(false)
    }
  }

  const handleCancelNav = () => {
    setPendingNav(null)
  }

  const activeGame = activeGameId ? getGameById(activeGameId) : null
  const GameComponent = activeGame?.component

  return (
    <GameSessionProvider setInProgress={setInProgress} isExternallyPaused={isExternallyPaused}>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <Header
          games={games}
          activeGameId={activeGameId}
          onNavigate={navigateTo}
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          onMenuClose={() => setIsMenuOpen(false)}
        />

        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center overflow-auto">
          <AnimatePresence mode="wait">
            {activeGameId && GameComponent ? (
              <motion.div
                key={activeGameId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
              >
                <GameComponent />
              </motion.div>
            ) : (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
              >
                <HomeHub games={games} onSelect={navigateTo} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />

        <NavigationConfirmModal
          isOpen={pendingNav !== null}
          onConfirm={handleConfirmNav}
          onCancel={handleCancelNav}
        />
      </div>
    </GameSessionProvider>
  )
}
