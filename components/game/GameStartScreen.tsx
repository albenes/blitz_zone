import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface GameStartScreenProps {
  title: string
  description: string
  onStart: () => void
}

export function GameStartScreen({ title, description, onStart }: GameStartScreenProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center max-w-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-gray-300 mb-6">{description}</p>
      <Button
        onClick={onStart}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
        aria-label={`Start ${title}`}
      >
        Start Game
      </Button>
    </motion.div>
  )
}
