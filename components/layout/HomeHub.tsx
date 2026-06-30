import { motion } from "framer-motion"
import type { GameDefinition, GameId } from "@/lib/game-types"

interface HomeHubProps {
  games: GameDefinition[]
  onSelect: (id: GameId) => void
}

export function HomeHub({ games, onSelect }: HomeHubProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
          BlitzZone
        </h1>
        <p className="text-gray-300 text-lg">Fast-paced games for quick minds</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl">
        {games.map((game, index) => {
          const Icon = game.icon
          return (
            <motion.button
              key={game.id}
              onClick={() => onSelect(game.id)}
              className="group text-left p-6 rounded-2xl bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 hover:bg-opacity-20 hover:border-blue-400 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Play ${game.name}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                  <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {game.name}
                </h2>
              </div>
              <p className="text-gray-300 text-sm mb-3">{game.description}</p>
              <span className="inline-block text-xs font-semibold text-blue-300 bg-blue-900 bg-opacity-40 px-3 py-1 rounded-full">
                {game.duration}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
