import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import wordList from "@/public/words.json"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"

const WORD_LENGTH = 5
const MAX_ATTEMPTS = 6
const GAME_DURATION = 120

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

export default function WordBlitz() {
  const [board, setBoard] = useState<string[]>(Array(MAX_ATTEMPTS).fill(""))
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [usedLetters, setUsedLetters] = useState<Record<string, "correct" | "present" | "absent">>({})
  const [gameState, setGameState] = useState<"playing" | "summary">("playing")
  const [targetWord, setTargetWord] = useState("")
  const [words, setWords] = useState<string[]>([])
  const { score, streak, addScore, incrementStreak, reset: resetScore } = useGameScore()

  const handleTimeUp = useCallback(() => setGameState("summary"), [])
  const { formattedTime, timeLeft, reset: resetTimer } = useGameTimer({
    duration: GAME_DURATION,
    isActive: gameState === "playing",
    onTimeUp: handleTimeUp,
  })

  useEffect(() => {
    setWords(wordList.words)
  }, [])

  const getRandomWord = useCallback(() => {
    return words[Math.floor(Math.random() * words.length)].toUpperCase()
  }, [words])

  const checkWord = useCallback(() => {
    const currentWord = board[currentAttempt]
    if (currentWord.length !== WORD_LENGTH) return

    const newUsedLetters = { ...usedLetters }
    let correct = 0
    const letterCount: Record<string, number> = {}

    for (const letter of targetWord) {
      letterCount[letter] = (letterCount[letter] || 0) + 1
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentWord[i] === targetWord[i]) {
        newUsedLetters[currentWord[i]] = "correct"
        correct++
        letterCount[currentWord[i]]--
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (currentWord[i] !== targetWord[i]) {
        if (letterCount[currentWord[i]] > 0) {
          newUsedLetters[currentWord[i]] =
            newUsedLetters[currentWord[i]] === "correct" ? "correct" : "present"
          letterCount[currentWord[i]]--
        } else {
          newUsedLetters[currentWord[i]] = newUsedLetters[currentWord[i]] || "absent"
        }
      }
    }

    setUsedLetters(newUsedLetters)

    if (correct === WORD_LENGTH) {
      addScore(100 + timeLeft)
      incrementStreak()
      setTargetWord(getRandomWord())
      setBoard(Array(MAX_ATTEMPTS).fill(""))
      setCurrentAttempt(0)
      setUsedLetters({})
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameState("summary")
    } else {
      setCurrentAttempt((prev) => prev + 1)
    }
  }, [board, currentAttempt, targetWord, usedLetters, timeLeft, getRandomWord, addScore, incrementStreak])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState !== "playing") return

      setBoard((prevBoard) => {
        const newBoard = [...prevBoard]
        const currentWord = newBoard[currentAttempt]

        if (key === "Backspace" && currentWord.length > 0) {
          newBoard[currentAttempt] = currentWord.slice(0, -1)
        } else if (key === "Enter" && currentWord.length === WORD_LENGTH) {
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

  const resetGame = useCallback(() => {
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setGameState("playing")
    resetTimer(GAME_DURATION)
    setTargetWord(getRandomWord())
    resetScore()
  }, [getRandomWord, resetTimer, resetScore])

  useEffect(() => {
    if (words.length > 0 && !targetWord) {
      resetGame()
    }
  }, [words, targetWord, resetGame])

  const getLetterColor = useCallback(
    (rowIndex: number, colIndex: number, letter: string) => {
      if (rowIndex >= currentAttempt) return "bg-opacity-20 bg-white"
      if (letter === targetWord[colIndex]) return "bg-green-500"
      if (targetWord.includes(letter)) return "bg-yellow-500"
      return "bg-gray-400"
    },
    [currentAttempt, targetWord]
  )

  return (
    <GameContainer title="Word Blitz">
      <GameHUD formattedTime={formattedTime} score={score} streak={streak} streakLabel="Words" />
      <motion.div
        className="grid grid-rows-6 gap-2 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2">
            {Array(WORD_LENGTH)
              .fill("")
              .map((_, colIndex) => {
                const letter = row[colIndex] || ""
                return (
                  <motion.div
                    key={colIndex}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${getLetterColor(rowIndex, colIndex, letter)}`}
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
      <GameSummaryModal
        isOpen={gameState === "summary"}
        stats={[
          { label: "Final Score", value: score },
          { label: "Words Guessed", value: streak },
        ]}
        onPlayAgain={resetGame}
      />
    </GameContainer>
  )
}
