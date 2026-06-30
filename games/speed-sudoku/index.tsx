import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"
import {
  generateSudokuPuzzle,
  isSubgridComplete,
  isSubgridCorrect,
  isInEmptySubgrid,
  type SudokuGrid,
  type SudokuPuzzle,
} from "@/lib/sudoku"

const GAME_DURATION = 90
const PENALTY_TIME = 5

export default function SpeedSudoku() {
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [grid, setGrid] = useState<SudokuGrid>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [gameState, setGameState] = useState<"ready" | "playing" | "summary">("ready")
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const { score, streak, addScore, incrementStreak, reset: resetScore } = useGameScore()

  const handleTimeUp = useCallback(() => setGameState("summary"), [])
  const { formattedTime, timeLeft, reset: resetTimer, penalize } = useGameTimer({
    duration: GAME_DURATION,
    isActive: gameState === "playing",
    onTimeUp: handleTimeUp,
  })

  const loadPuzzle = useCallback(() => {
    const newPuzzle = generateSudokuPuzzle()
    setPuzzle(newPuzzle)
    setGrid(newPuzzle.grid.map((row) => [...row]))
    setSelectedCell(null)
    setGameState("playing")
  }, [])

  useEffect(() => {
    if (gameState === "ready") {
      loadPuzzle()
    }
  }, [gameState, loadPuzzle])

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
        addScore(Math.max(0, timeLeft))
        incrementStreak()
        setTotalCompleted((prev) => prev + 1)
        if (timeLeft > 0) {
          loadPuzzle()
        } else {
          setGameState("summary")
        }
      } else {
        showError(`Incorrect subgrid — ${PENALTY_TIME}s penalty`)
      }
    },
    [puzzle, timeLeft, addScore, incrementStreak, loadPuzzle, showError]
  )

  const setCellValue = useCallback(
    (row: number, col: number, value: number | null) => {
      if (gameState !== "playing" || !puzzle) return
      if (!isInEmptySubgrid(row, col, puzzle.emptySubgrid)) return

      const newGrid = grid.map((r) => [...r])
      newGrid[row][col] = value
      setGrid(newGrid)

      if (isSubgridComplete(newGrid, puzzle.emptySubgrid)) {
        handleSubgridSubmit(newGrid)
      }
    },
    [gameState, puzzle, grid, handleSubgridSubmit]
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
    resetTimer(GAME_DURATION)
    resetScore()
    setTotalCompleted(0)
    setErrorMessage(null)
    setGameState("ready")
  }

  if (!puzzle) return null

  return (
    <GameContainer title="Speed Sudoku">
      <GameHUD formattedTime={formattedTime} score={score} streak={streak} />

      <AnimatePresence>
        {errorMessage && (
          <motion.p
            className="text-red-400 font-semibold mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isShaking ? 0.4 : 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="grid grid-cols-9 gap-1 mb-6">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const inEmpty = isInEmptySubgrid(rowIndex, colIndex, puzzle.emptySubgrid)
                  const isSelected =
                    selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex
                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-semibold rounded-lg
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

            <div className="grid grid-cols-5 gap-2 max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  className="w-12 h-12 bg-opacity-20 bg-white hover:bg-opacity-40 rounded-lg font-bold text-lg disabled:opacity-40"
                  disabled={!selectedCell}
                  onClick={() => handleNumberPress(num)}
                  whileHover={{ scale: selectedCell ? 1.1 : 1 }}
                  whileTap={{ scale: selectedCell ? 0.95 : 1 }}
                >
                  {num}
                </motion.button>
              ))}
              <motion.button
                className="col-span-2 w-full h-12 bg-opacity-20 bg-white hover:bg-opacity-40 rounded-lg font-semibold disabled:opacity-40"
                disabled={!selectedCell}
                onClick={handleClear}
                whileHover={{ scale: selectedCell ? 1.05 : 1 }}
                whileTap={{ scale: selectedCell ? 0.95 : 1 }}
              >
                Clear
              </motion.button>
            </div>
            <p className="text-sm text-gray-300 mt-4">
              Tap a highlighted cell, then pick a number
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <GameSummaryModal
        isOpen={gameState === "summary"}
        stats={[
          { label: "Final Score", value: score },
          { label: "Streak", value: streak },
          { label: "Grids Completed", value: totalCompleted },
        ]}
        onPlayAgain={resetGame}
      />
    </GameContainer>
  )
}
