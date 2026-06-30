import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { GameSummaryStat } from "@/lib/game-types"

interface GameSummaryModalProps {
  isOpen: boolean
  title?: string
  stats: GameSummaryStat[]
  onPlayAgain: () => void
}

export function GameSummaryModal({
  isOpen,
  title = "Game Summary",
  stats,
  onPlayAgain,
}: GameSummaryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-summary-title"
        >
          <motion.div
            className="bg-white text-black p-6 sm:p-8 rounded-lg shadow-lg text-center mx-4 max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h2 id="game-summary-title" className="text-2xl sm:text-3xl font-bold mb-4">
              {title}
            </h2>
            {stats.map(({ label, value }) => (
              <p key={label} className="text-xl mb-2">
                {label}: {value}
              </p>
            ))}
            <Button
              onClick={onPlayAgain}
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
