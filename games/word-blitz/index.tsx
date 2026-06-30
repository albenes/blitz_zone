import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import wordList from "@/public/words.json"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { GameStartScreen } from "@/components/game/GameStartScreen"
import { LetterTile } from "@/components/game/LetterTile"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"
import { useGameState } from "@/hooks/useGameState"
import { useGameSession } from "@/contexts/GameSessionContext"
import { useHighScore } from "@/hooks/useHighScore"
import {
  evaluateGuess,
  mergeLetterStates,
  letterResultToColor,
  type LetterResult,
} from "@/lib/evaluate-guess"
import { calcWordBlitzWordScore, WORD_BLITZ_CONFIG } from "@/lib/scoring"

const WORD_LENGTH = WORD_BLITZ_CONFIG.WORD_LENGTH
const MAX_ATTEMPTS = WORD_BLITZ_CONFIG.MAX_ATTEMPTS
const GAME_DURATION = WORD_BLITZ_CONFIG.DURATION_SECONDS

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
  const [targetWord, setTargetWord] = useState("")
  const [words, setWords] = useState<string[]>([])
  const [lastFailedWord, setLastFailedWord] = useState<string | null>(null)
  const [invalidWordMessage, setInvalidWordMessage] = useState<string | null>(null)
  const [revealedWord, setRevealedWord] = useState<string | null>(null)
  const { score, streak, addScore, incrementStreak, reset: resetScore, setStreak } = useGameScore()
  const gameState = useGameState("idle")
  const { setInProgress, isExternallyPaused } = useGameSession()
  const { highScore, isNewRecord, recordScore, resetRecordFlag } = useHighScore("word-blitz")
  const { end: endGame } = gameState

  const wordSet = useMemo(
    () => new Set(words.map((w) => w.toUpperCase())),
    [words]
  )

  const handleTimeUp = useCallback(() => endGame(), [endGame])
  const timerActive = gameState.isTimerActive && !isExternallyPaused
  const { formattedTime, timeLeft, reset: resetTimer } = useGameTimer({
    duration: GAME_DURATION,
    isActive: timerActive,
    onTimeUp: handleTimeUp,
  })

  useEffect(() => {
    setInProgress(gameState.isPlaying)
    return () => setInProgress(false)
  }, [gameState.isPlaying, setInProgress])

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
      addScore(calcWordBlitzWordScore(timeLeft))
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
      if (!gameState.isPlaying || revealedWord || isExternallyPaused) return

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
    [checkWord, currentAttempt, gameState.isPlaying, revealedWord, isExternallyPaused]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key)
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyPress])

  useEffect(() => {
    if (gameState.isSummary) {
      recordScore(score)
    }
  }, [gameState.isSummary, score, recordScore])

  const handleStart = useCallback(() => {
    resetRecordFlag()
    resetTimer(GAME_DURATION)
    resetScore()
    setLastFailedWord(null)
    setRevealedWord(null)
    setInvalidWordMessage(null)
    setTargetWord(getRandomWord())
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setRowResults([])
    gameState.start()
  }, [getRandomWord, resetTimer, resetScore, gameState, resetRecordFlag])

  const resetGame = useCallback(() => {
    resetRecordFlag()
    gameState.toIdle()
    setBoard(Array(MAX_ATTEMPTS).fill(""))
    setCurrentAttempt(0)
    setUsedLetters({})
    setRowResults([])
    resetTimer(GAME_DURATION)
    setTargetWord("")
    resetScore()
    setLastFailedWord(null)
    setRevealedWord(null)
    setInvalidWordMessage(null)
  }, [resetTimer, resetScore, gameState, resetRecordFlag])

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
      {gameState.isIdle ? (
        <GameStartScreen
          title="Word Blitz"
          description="Guess as many 5-letter words as you can in 2 minutes. Green = correct spot, yellow = wrong spot."
          onStart={handleStart}
        />
      ) : (
        <>
          <GameHUD
            formattedTime={formattedTime}
            score={score}
            streak={streak}
            streakLabel="Words"
            isPaused={isExternallyPaused}
          />

          <div aria-live="polite" className="min-h-[1.5rem] mb-4 text-center">
            <AnimatePresence>
              {invalidWordMessage && (
                <motion.p
                  className="text-yellow-400 font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                >
                  {invalidWordMessage}
                </motion.p>
              )}
              {revealedWord && (
                <motion.p
                  className="text-red-300 font-semibold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  The word was: <span className="text-white font-bold">{revealedWord}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="grid grid-rows-6 gap-1 sm:gap-2 mb-4 sm:mb-6"
            role="grid"
            aria-label="Word guesses"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-1 sm:gap-2" role="row">
                {Array(WORD_LENGTH)
                  .fill("")
                  .map((_, colIndex) => {
                    const letter = row[colIndex] || ""
                    return (
                      <LetterTile
                        key={colIndex}
                        letter={letter}
                        colorClass={getLetterColor(rowIndex, colIndex)}
                        isFlipped={rowIndex < rowResults.length}
                        colIndex={colIndex}
                      />
                    )
                  })}
              </div>
            ))}
          </motion.div>

          <motion.div
            className="mb-6 w-full max-w-lg"
            role="group"
            aria-label="On-screen keyboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {keyboard.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center mb-1 sm:mb-2">
                {row.map((key) => (
                  <motion.button
                    key={key}
                    className={`w-7 h-10 sm:w-9 md:w-10 sm:h-11 md:h-12 text-xs sm:text-sm ${letterResultToColor(usedLetters[key])} hover:bg-opacity-30 m-0.5 rounded-lg font-semibold transition-colors duration-300`}
                    onClick={() => handleKeyPress(key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Letter ${key}`}
                  >
                    {key}
                  </motion.button>
                ))}
              </div>
            ))}
            <div className="flex justify-center mt-1 sm:mt-2 gap-1">
              <motion.button
                className="w-16 sm:w-20 h-10 sm:h-12 bg-opacity-20 bg-white hover:bg-opacity-30 rounded-lg font-semibold text-sm transition-colors duration-300"
                onClick={() => handleKeyPress("Backspace")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Backspace"
              >
                ←
              </motion.button>
              <motion.button
                className="w-16 sm:w-20 h-10 sm:h-12 bg-opacity-20 bg-white hover:bg-opacity-30 rounded-lg font-semibold text-sm transition-colors duration-300"
                onClick={() => handleKeyPress("Enter")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Submit guess"
              >
                Enter
              </motion.button>
            </div>
          </motion.div>

          <GameSummaryModal
            isOpen={gameState.isSummary}
            stats={summaryStats}
            highScore={highScore}
            isNewRecord={isNewRecord}
            onPlayAgain={resetGame}
          />
        </>
      )}
    </GameContainer>
  )
}
