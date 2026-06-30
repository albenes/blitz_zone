import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import wordList from "@/public/words.json"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"
import {
  evaluateGuess,
  mergeLetterStates,
  letterResultToColor,
  type LetterResult,
} from "@/lib/evaluate-guess"

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
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterResult>>({})
  const [rowResults, setRowResults] = useState<LetterResult[][]>([])
  const [gameState, setGameState] = useState<"playing" | "summary">("playing")
  const [targetWord, setTargetWord] = useState("")
  const [words, setWords] = useState<string[]>([])
  const [lastFailedWord, setLastFailedWord] = useState<string | null>(null)
  const [invalidWordMessage, setInvalidWordMessage] = useState<string | null>(null)
  const [revealedWord, setRevealedWord] = useState<string | null>(null)
  const { score, streak, addScore, incrementStreak, reset: resetScore, setStreak } = useGameScore()

  const wordSet = useMemo(
    () => new Set(words.map((w) => w.toUpperCase())),
    [words]
  )

  const handleTimeUp = useCallback(() => setGameState("summary"), [])
  const { formattedTime, timeLeft, reset: resetTimer } = useGameTimer({
    duration: GAME_DURATION,
    isActive: gameState === "playing",
    onTimeUp: handleTimeUp,
  })

  useEffect(() => {
    setWords(wordList.words)
  }, [])

  useEffect(() => {
    if (!invalidWordMessage) return
    const timer = setTimeout(() => setInvalidWordMessage(null), 2000)
    return () => clearTimeout(timer)
  }, [invalidWordMessage])

  const getRandomWord = useCallback(() => {
    return words[Math.floor(Math.random() * words.length)].toUpperCase()
  }, [words])

  const startNextWord = useCallback(() => {
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setRowResults([])
    setTargetWord(getRandomWord())
  }, [getRandomWord])

  useEffect(() => {
    if (!revealedWord) return
    const timer = setTimeout(() => {
      setRevealedWord(null)
      startNextWord()
    }, 1500)
    return () => clearTimeout(timer)
  }, [revealedWord, startNextWord])

  const checkWord = useCallback(() => {
    const currentWord = board[currentAttempt]
    if (currentWord.length !== WORD_LENGTH) return

    if (!wordSet.has(currentWord)) {
      setInvalidWordMessage("Not in word list")
      return
    }

    const results = evaluateGuess(currentWord, targetWord)
    const newRowResults = [...rowResults, results]
    const newUsedLetters = mergeLetterStates(usedLetters, currentWord, targetWord)

    setRowResults(newRowResults)
    setUsedLetters(newUsedLetters)

    const isCorrect = results.every((r) => r === "correct")

    if (isCorrect) {
      addScore(100 + timeLeft)
      incrementStreak()
      startNextWord()
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setLastFailedWord(targetWord)
      setStreak(0)
      setRevealedWord(targetWord)
    } else {
      setCurrentAttempt((prev) => prev + 1)
    }
  }, [
    board,
    currentAttempt,
    targetWord,
    usedLetters,
    rowResults,
    wordSet,
    timeLeft,
    addScore,
    incrementStreak,
    startNextWord,
    setStreak,
  ])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState !== "playing" || revealedWord) return

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
    [checkWord, currentAttempt, gameState, revealedWord]
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
    setRowResults([])
    setGameState("playing")
    resetTimer(GAME_DURATION)
    setTargetWord(getRandomWord())
    resetScore()
    setLastFailedWord(null)
    setRevealedWord(null)
    setInvalidWordMessage(null)
  }, [getRandomWord, resetTimer, resetScore])

  useEffect(() => {
    if (words.length > 0 && !targetWord) {
      resetGame()
    }
  }, [words, targetWord, resetGame])

  const getLetterColor = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (rowIndex < rowResults.length) {
        return letterResultToColor(rowResults[rowIndex][colIndex])
      }
      return "bg-opacity-20 bg-white"
    },
    [rowResults]
  )

  const summaryStats = [
    { label: "Final Score", value: score },
    { label: "Words Guessed", value: streak },
    ...(lastFailedWord ? [{ label: "Last Missed Word", value: lastFailedWord }] : []),
  ]

  return (
    <GameContainer title="Word Blitz">
      <GameHUD formattedTime={formattedTime} score={score} streak={streak} streakLabel="Words" />

      <AnimatePresence>
        {invalidWordMessage && (
          <motion.p
            className="text-yellow-400 font-semibold mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {invalidWordMessage}
          </motion.p>
        )}
        {revealedWord && (
          <motion.p
            className="text-red-300 font-semibold mb-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            The word was: <span className="text-white font-bold">{revealedWord}</span>
          </motion.p>
        )}
      </AnimatePresence>

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
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${getLetterColor(rowIndex, colIndex)}`}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: letter && rowIndex < rowResults.length ? 360 : 0 }}
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
            {row.map((key) => (
              <motion.button
                key={key}
                className={`w-10 h-12 ${letterResultToColor(usedLetters[key])} hover:bg-opacity-30 m-0.5 rounded-lg font-semibold transition-colors duration-300`}
                onClick={() => handleKeyPress(key)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {key}
              </motion.button>
            ))}
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
        stats={summaryStats}
        onPlayAgain={resetGame}
      />
    </GameContainer>
  )
}
