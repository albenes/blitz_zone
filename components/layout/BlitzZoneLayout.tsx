import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { games, defaultGameId, getGameById } from "@/games/registry"
import type { GameId } from "@/lib/game-types"

export default function BlitzZoneLayout() {
  const [currentGameId, setCurrentGameId] = useState<GameId>(defaultGameId)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const currentGame = getGameById(currentGameId)
  const GameComponent = currentGame.component

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <Header
        games={games}
        currentGameId={currentGameId}
        onGameSelect={setCurrentGameId}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
      />

      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGameId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            <GameComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
