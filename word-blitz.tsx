"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import wordList from './public/words.json'

const WORD_LENGTH = 5
const MAX_ATTEMPTS = 6
const GAME_DURATION = 180 // 3 minutes in seconds

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

export default function Component() {
  const [board, setBoard] = useState(Array(MAX_ATTEMPTS).fill(""))
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [usedLetters, setUsedLetters] = useState<Record<string, "correct" | "present" | "absent">>({})
  const [gameState, setGameState] = useState("playing") // 'playing', 'summary'
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [targetWord, setTargetWord] = useState("")
  const [words, setWords] = useState<string[]>([])

  useEffect(() => {
    setWords(wordList.words)
  }, [])

  const getRandomWord = useCallback(() => {
    return words[Math.floor(Math.random() * words.length)]
  }, [words])

  const checkWord = useCallback(() => {
    const currentWord = board[currentAttempt]
    if (currentWord.length !== WORD_LENGTH) return

    let newUsedLetters = { ...usedLetters }
    let correct = 0
    let letterCount: Record<string, number> = {}

    // Count occurrences of each letter in the target word
    for (let letter of targetWord) {
      letterCount[letter] = (letterCount[letter] || 0) + 1
    }

    // First pass: Mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentWord[i] === targetWord[i]) {
        newUsedLetters[currentWord[i]] = "correct"
        correct++
        letterCount[currentWord[i]]--
      }
    }

    // Second pass: Mark present or absent letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentWord[i] !== targetWord[i]) {
        if (letterCount[currentWord[i]] > 0) {
          newUsedLetters[currentWord[i]] = "present"
          letterCount[currentWord[i]]--
        } else {
          newUsedLetters[currentWord[i]] = "absent"
        }
      }
    }

    setUsedLetters(newUsedLetters)

    if (correct === WORD_LENGTH) {
      setScore((prevScore) => prevScore + 100 + timeLeft)
      setStreak((prevStreak) => prevStreak + 1)
      setTargetWord(getRandomWord())
      setBoard(Array(MAX_ATTEMPTS).fill(""))
      setCurrentAttempt(0)
      setUsedLetters({})
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameState("summary")
    } else {
      setCurrentAttempt((prev) => prev + 1)
    }
  }, [board, currentAttempt, targetWord, usedLetters, timeLeft, getRandomWord])

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
      setGameState("summary")
    }
  }, [timeLeft, gameState])

  const resetGame = () => {
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setGameState("playing")
    setTimeLeft(GAME_DURATION)
    setTargetWord(getRandomWord())
    setScore(0)
    setStreak(0)
  }

  useEffect(() => {
    if (words.length > 0) {
      resetGame()
    }
  }, [words])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white p-4">
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
        <motion.div
          className="text-2xl font-semibold bg-opacity-20 bg-white backdrop-blur-md rounded-full px-6 py-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Streak: {streak}
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
      {gameState === "summary" && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white text-black p-8 rounded-lg shadow-lg text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-4">Game Summary</h2>
            <p className="text-xl mb-2">Final Score: {score}</p>
            <p className="text-xl mb-4">Words Guessed: {streak}</p>
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}