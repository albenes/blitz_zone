import { motion } from "framer-motion"

interface GameHUDProps {
  formattedTime: string
  score: number
  streak: number
  streakLabel?: string
  isPaused?: boolean
}

export function GameHUD({ formattedTime, score, streak, streakLabel = "Streak", isPaused }: GameHUDProps) {
  const items = [
    { label: "Time", value: isPaused ? `${formattedTime} ⏸` : formattedTime },
    { label: "Score", value: score },
    { label: streakLabel, value: streak },
  ]

  return (
    <div
      className="mb-6 grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg"
      role="status"
      aria-live="polite"
      aria-label="Game statistics"
    >
      {items.map(({ label, value }) => (
        <motion.div
          key={label}
          className="text-sm sm:text-xl md:text-2xl font-semibold bg-opacity-20 bg-white backdrop-blur-md rounded-full px-2 sm:px-4 md:px-6 py-2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="hidden sm:inline">{label}: </span>
          <span className="sm:hidden">{label.charAt(0)}: </span>
          {value}
        </motion.div>
      ))}
    </div>
  )
}
