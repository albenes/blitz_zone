"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Zap, Clock, Brain, Palette, Shuffle } from "lucide-react"
import WordBlitz from "./word-blitz"
import SpeedSudoku from "./speed-sudoku"

const games = [
  { name: "Word Blitz", icon: <Zap className="w-4 h-4" />, component: <WordBlitz /> },
  { name: "Speed Sudoku", icon: <Clock className="w-4 h-4" />, component: <SpeedSudoku /> },
  { name: "Math Challenge", icon: <Brain className="w-4 h-4" />, component: <div>Math Challenge Game</div> },
  { name: "Color Match", icon: <Palette className="w-4 h-4" />, component: <div>Color Match Game</div> },
  { name: "Memory Match", icon: <Brain className="w-4 h-4" />, component: <div>Memory Match Game</div> },
  { name: "Anagram Solver", icon: <Shuffle className="w-4 h-4" />, component: <div>Anagram Solver Game</div> },
]

export default function BlitzZoneLayout() {
  const [currentGame, setCurrentGame] = useState(games[0])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 bg-indigo-900">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            BlitzZone
          </Link>
          <div className="hidden md:flex space-x-4">
            {games.map((game) => (
              <Button
                key={game.name}
                variant="ghost"
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => setCurrentGame(game)}
              >
                {game.name}
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-indigo-800 border-indigo-700">
                {games.map((game) => (
                  <DropdownMenuItem
                    key={game.name}
                    onSelect={() => {
                      setCurrentGame(game)
                      setIsMenuOpen(false)
                    }}
                    className="text-white hover:bg-indigo-700"
                  >
                    {game.icon}
                    <span className="ml-2">{game.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl"
          >
            {currentGame.component}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-indigo-900 bg-opacity-80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-2 md:mb-0">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                BlitzZone
              </h2>
              <p className="text-xs text-gray-300">Fast-paced games for quick minds</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="text-xs text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-xs text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-xs text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} BlitzZone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}