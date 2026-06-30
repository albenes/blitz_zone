import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { GameStartScreen } from "@/components/game/GameStartScreen"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"
import { useGameState } from "@/hooks/useGameState"
import { useGameSession } from "@/contexts/GameSessionContext"
import { useHighScore } from "@/hooks/useHighScore"
import {
  generateSudokuPuzzle,
  isSubgridComplete,
  isSubgridCorrect,
  isInEmptySubgrid,
  type SudokuGrid,
  type SudokuPuzzle,
} from "@/lib/sudoku"
import { calcSudokuSubgridScore, SPEED_SUDOKU_CONFIG } from "@/lib/scoring"

const GAME_DURATION = SPEED_SUDOKU_CONFIG.DURATION_SECONDS
const PENALTY_TIME = SPEED_SUDOKU_CONFIG.PENALTY_SECONDS

export default function SpeedSudoku() {
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [grid, setGrid] = useState<SudokuGrid>([])
  const [puzzleKey, setPuzzleKey] = useState(0)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const { score, streak, addScore, incrementStreak, reset: resetScore } = useGameScore()
  const gameState = useGameState("idle")
  const { setInProgress, isExternallyPaused } = useGameSession()
  const { highScore, isNewRecord, recordScore, resetRecordFlag } = useHighScore("speed-sudoku")

  const handleTimeUp = useCallback(() => gameState.end(), [gameState])
  const timerActive = gameState.isTimerActive && !isExternallyPaused
  const { formattedTime, timeLeft, reset: resetTimer, penalize } = useGameTimer({
    duration: GAME_DURATION,
    isActive: timerActive,
    onTimeUp: handleTimeUp,
  })

  useEffect(() => {
    setInProgress(gameState.isPlaying)
    return () => setInProgress(false)
  }, [gameState.isPlaying, setInProgress])

  const loadPuzzle = useCallback(() => {
    const newPuzzle = generateSudokuPuzzle()
    setPuzzle(newPuzzle)
    setGrid(newPuzzle.grid.map((row) => [...row]))
    setSelectedCell(null)
    setPuzzleKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (gameState.isSummary) {
      recordScore(score)
    }
  }, [gameState.isSummary, score, recordScore])

  const handleStart = useCallback(() => {
    resetRecordFlag()
    resetTimer(GAME_DURATION)
    resetScore()
    setTotalCompleted(0)
    setErrorMessage(null)
    loadPuzzle()
    gameState.start()
  }, [resetTimer, resetScore, loadPuzzle, gameState, resetRecordFlag])

  useEffect(() => {
    if (!errorMessage) return
    const timer = setTimeout(() => setErrorMessage(null), 2000)
    return () => clearTimeout(timer)
  }, [errorMessage])

  const showError = useCallback(
    (message: string) => {
      penalize(PENALTY_TIME)
      setErrorMessage(message)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    },
    [penalize]
  )

  const handleSubgridSubmit = useCallback(
    (newGrid: SudokuGrid) => {
      if (!puzzle) return

      if (isSubgridCorrect(newGrid, puzzle.solution, puzzle.emptySubgrid)) {
        addScore(calcSudokuSubgridScore(timeLeft))
        incrementStreak()
        setTotalCompleted((prev) => prev + 1)
        if (timeLeft > 0) {
          loadPuzzle()
        } else {
          gameState.end()
        }
      } else {
        showError(`Incorrect subgrid — ${PENALTY_TIME}s penalty`)
      }
    },
    [puzzle, timeLeft, addScore, incrementStreak, loadPuzzle, showError, gameState]
  )

  const setCellValue = useCallback(
    (row: number, col: number, value: number | null) => {
      if (!gameState.isPlaying || !puzzle || isExternallyPaused) return
      if (!isInEmptySubgrid(row, col, puzzle.emptySubgrid)) return

      const newGrid = grid.map((r) => [...r])
      newGrid[row][col] = value
      setGrid(newGrid)

      if (isSubgridComplete(newGrid, puzzle.emptySubgrid)) {
        handleSubgridSubmit(newGrid)
      }
    },
    [gameState.isPlaying, puzzle, grid, handleSubgridSubmit, isExternallyPaused]
  )

  const handleNumberPress = (num: number) => {
    if (!selectedCell) return
    setCellValue(selectedCell[0], selectedCell[1], num)
  }

  const handleClear = () => {
    if (!selectedCell) return
    setCellValue(selectedCell[0], selectedCell[1], null)
  }

  const resetGame = () => {
    resetRecordFlag()
    gameState.toIdle()
    resetTimer(GAME_DURATION)
    resetScore()
    setTotalCompleted(0)
    setErrorMessage(null)
    setPuzzle(null)
    setGrid([])
  }

  return (
    <GameContainer title="Speed Sudoku">
      {gameState.isIdle ? (
        <GameStartScreen
          title="Speed Sudoku"
          description="Fill the highlighted 3×3 subgrids before time runs out. Wrong answers cost 5 seconds."
          onStart={handleStart}
        />
      ) : puzzle ? (
        <>
          <GameHUD
            formattedTime={formattedTime}
            score={score}
            streak={streak}
            isPaused={isExternallyPaused}
          />

          <div aria-live="polite" className="min-h-[1.5rem] mb-4 text-center">
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  className="text-red-400 font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {gameState.isPlaying && (
              <motion.div
                key={puzzleKey}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={
                  isShaking
                    ? { x: [0, -8, 8, -8, 8, 0], opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1, x: 0 }
                }
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: isShaking ? 0.4 : 0.35 }}
                className="flex flex-col items-center"
              >
                <div
                  className="grid grid-cols-9 gap-0.5 sm:gap-1 mb-4 sm:mb-6"
                  role="grid"
                  aria-label="Sudoku board"
                >
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const inEmpty = isInEmptySubgrid(rowIndex, colIndex, puzzle.emptySubgrid)
                      const isSelected =
                        selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          role="gridcell"
                          aria-selected={isSelected}
                          aria-label={
                            inEmpty
                              ? `Empty cell row ${rowIndex + 1} column ${colIndex + 1}`
                              : `Fixed ${cell} row ${rowIndex + 1} column ${colIndex + 1}`
                          }
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-sm sm:text-lg font-semibold rounded-md sm:rounded-lg
                            ${inEmpty ? "bg-blue-200 cursor-pointer text-blue-800" : "bg-opacity-20 bg-white text-white"}
                            ${isSelected ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent" : ""}
                            ${(rowIndex + 1) % 3 === 0 ? "border-b-2 border-white" : ""}
                            ${(colIndex + 1) % 3 === 0 ? "border-r-2 border-white" : ""}`}
                          whileHover={inEmpty ? { scale: 1.05 } : {}}
                          whileTap={inEmpty ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (inEmpty) setSelectedCell([rowIndex, colIndex])
                          }}
                        >
                          {cell || ""}
                        </motion.div>
                      )
                    })
                  )}
                </div>

                <div
                  className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full max-w-xs sm:max-w-sm"
                  role="group"
                  aria-label="Number pad"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <motion.button
                      key={num}
                      className="w-full h-11 sm:h-12 bg-opacity-20 bg-white hover:bg-opacity-40 rounded-lg font-bold text-base sm:text-lg disabled:opacity-40"
                      disabled={!selectedCell || isExternallyPaused}
                      onClick={() => handleNumberPress(num)}
                      whileHover={{ scale: selectedCell ? 1.05 : 1 }}
                      whileTap={{ scale: selectedCell ? 0.95 : 1 }}
                      aria-label={`Enter ${num}`}
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    className="col-span-2 w-full h-11 sm:h-12 bg-opacity-20 bg-white hover:bg-opacity-40 rounded-lg font-semibold disabled:opacity-40"
                    disabled={!selectedCell || isExternallyPaused}
                    onClick={handleClear}
                    whileHover={{ scale: selectedCell ? 1.05 : 1 }}
                    whileTap={{ scale: selectedCell ? 0.95 : 1 }}
                    aria-label="Clear cell"
                  >
                    Clear
                  </motion.button>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-3 sm:mt-4 text-center">
                  Tap a highlighted cell, then pick a number
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <GameSummaryModal
            isOpen={gameState.isSummary}
            stats={[
              { label: "Final Score", value: score },
              { label: "Streak", value: streak },
              { label: "Grids Completed", value: totalCompleted },
            ]}
            highScore={highScore}
            isNewRecord={isNewRecord}
            onPlayAgain={resetGame}
          />
        </>
      ) : null}
    </GameContainer>
  )
}
