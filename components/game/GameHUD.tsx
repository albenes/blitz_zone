import { motion } from "framer-motion"

interface GameHUDProps {
  formattedTime: string
  score: number
  streak: number
  streakLabel?: string
}

export function GameHUD({ formattedTime, score, streak, streakLabel = "Streak" }: GameHUDProps) {
  const items = [
    { label: "Time", value: formattedTime, x: -50 },
    { label: "Score", value: score, x: 50 },
    { label: streakLabel, value: streak, x: 50 },
  ]

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-4">
      {items.map(({ label, value, x }) => (
        <motion.div
          key={label}
          className="text-xl sm:text-2xl font-semibold bg-opacity-20 bg-white backdrop-blur-md rounded-full px-4 sm:px-6 py-2"
          initial={{ opacity: 0, x }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {label}: {value}
        </motion.div>
      ))}
    </div>
  )
}
