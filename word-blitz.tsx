"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const WORD_LENGTH = 5
const MAX_ATTEMPTS = 6
const GAME_DURATION = 180 // 3 minutes in seconds

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

const words = ['REACT', 'REDUX', 'HOOKS', 'STATE', 'PROPS', 'ASYNC', 'FETCH', 'ROUTE', 'STYLE', 'BUILD']

export default function Component() {
  const [board, setBoard] = useState(Array(MAX_ATTEMPTS).fill(""))
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [usedLetters, setUsedLetters] = useState<Record<string, "correct" | "present" | "absent">>({})
  const [gameState, setGameState] = useState("playing") // 'playing', 'won', 'lost'
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [targetWord, setTargetWord] = useState("")

  const checkWord = useCallback(() => {
    const currentWord = board[currentAttempt]
    if (currentWord.length !== WORD_LENGTH) return

    let newUsedLetters = { ...usedLetters }
    let correct = 0

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentWord[i] === targetWord[i]) {
        newUsedLetters[currentWord[i]] = "correct"
        correct++
      } else if (targetWord.includes(currentWord[i])) {
        newUsedLetters[currentWord[i]] = "present"
      } else {
        newUsedLetters[currentWord[i]] = "absent"
      }
    }

    setUsedLetters(newUsedLetters)

    if (correct === WORD_LENGTH) {
      setGameState("won")
      setScore((prevScore) => prevScore + 100 + timeLeft)
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameState("lost")
    } else {
      setCurrentAttempt((prev) => prev + 1)
    }
  }, [board, currentAttempt, targetWord, usedLetters, timeLeft])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState !== "playing") return

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard]
        const currentWord = newBoard[currentAttempt]

        if (key === "Backspace" && currentWord.length > 0) {
          newBoard[currentAttempt] = currentWord.slice(0, -1)
        } else if (key === "Enter") {
          checkWord()
        } else if (currentWord.length < WORD_LENGTH && key.length === 1 && key.match(/[a-z]/i)) {
          newBoard[currentAttempt] = currentWord + key.toUpperCase()
        }

        return newBoard
      })
    },
    [checkWord, currentAttempt, gameState]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key)
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyPress])

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameState("lost")
    }
  }, [timeLeft, gameState])

  const resetGame = () => {
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setGameState("playing")
    setTimeLeft(GAME_DURATION)
    setTargetWord(words[Math.floor(Math.random() * words.length)])
    setScore(0)
  }

  useEffect(() => {
    resetGame()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white p-4">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animation: `twinkle ${Math.random() * 5 + 5}s linear infinite`,
            }}
          />
        ))}
      </div>
      <motion.h1
        className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Word Blitz
      </motion.h1>
      <div className="mb-6 flex space-x-8">
        <motion.div
          className="text-2xl font-semibold bg-opacity-20 bg-white backdrop-blur-md rounded-full px-6 py-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </motion.div>
        <motion.div
          className="text-2xl font-semibold bg-opacity-20 bg-white backdrop-blur-md rounded-full px-6 py-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Score: {score}
        </motion.div>
      </div>
      <motion.div
        className="grid grid-rows-6 gap-2 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {Array(WORD_LENGTH)
              .fill('')
              .map((_, colIndex) => {
                const letter = row[colIndex] || ""
                let bgColor = "bg-opacity-20 bg-white"
                if (rowIndex < currentAttempt) {
                  if (letter === targetWord[colIndex]) bgColor = "bg-green-500"
                  else if (targetWord.includes(letter)) bgColor = "bg-yellow-500"
                  else bgColor = "bg-gray-400"
                }
                return (
                  <motion.div
                    key={colIndex}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${bgColor}`}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: letter ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {letter}
                  </motion.div>
                )
              })}
          </div>
        ))}
      </motion.div>
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2">
            {row.map((key) => {
              let bgColor = "bg-opacity-20 bg-white hover:bg-opacity-30"
              if (usedLetters[key] === "correct") bgColor = "bg-green-500"
              else if (usedLetters[key] === "present") bgColor = "bg-yellow-500"
              else if (usedLetters[key] === "absent") bgColor = "bg-gray-400"
              return (
                <motion.button
                  key={key}
                  className={`w-10 h-12 ${bgColor} m-0.5 rounded-lg font-semibold transition-colors duration-300`}
                  onClick={() => handleKeyPress(key)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {key}
                </motion.button>
              )
            })}
          </div>
        ))}
        <div className="flex justify-center mt-2">
          <motion.button
            className="w-20 h-12 bg-opacity-20 bg-white hover:bg-opacity-30 m-0.5 rounded-lg font-semibold transition-colors duration-300"
            onClick={() => handleKeyPress("Backspace")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ←
          </motion.button>
          <motion.button
            className="w-20 h-12 bg-opacity-20 bg-white hover:bg-opacity-30 m-0.5 rounded-lg font-semibold transition-colors duration-300"
            onClick={() => handleKeyPress("Enter")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Enter
          </motion.button>
        </div>
      </motion.div>
      {gameState !== "playing" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-3xl font-bold mb-6">
            {gameState === "won" ? "Congratulations! You won!" : "Game Over!"}
          </p>
          <Button
            onClick={resetGame}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  )
}