import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface GameContainerProps {
  title: string
  children: ReactNode
}

export function GameContainer({ title, children }: GameContainerProps) {
  return (
    <section
      className="flex flex-col items-center w-full text-white p-2 sm:p-4"
      aria-label={title}
    >
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h1>
      {children}
    </section>
  )
}
