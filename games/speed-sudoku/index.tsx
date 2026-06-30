import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameContainer } from "@/components/game/GameContainer"
import { GameHUD } from "@/components/game/GameHUD"
import { GameSummaryModal } from "@/components/game/GameSummaryModal"
import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameScore } from "@/hooks/useGameScore"

const GRID_SIZE = 9
const SUBGRID_SIZE = 3
const GAME_DURATION = 90
const PENALTY_TIME = 5

type SudokuGrid = (number | null)[][]

const generateSudoku = (): SudokuGrid => {
  const grid: SudokuGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null))

  const isValid = (grid: SudokuGrid, num: number, row: number, col: number): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false
    }
    const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE
    const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE
    for (let i = 0; i < SUBGRID_SIZE; i++) {
      for (let j = 0; j < SUBGRID_SIZE; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    return true
  }

  const fillGrid = (row: number, col: number): boolean => {
    if (col === GRID_SIZE) {
      col = 0
      row++
      if (row === GRID_SIZE) return true
    }

    if (grid[row][col] !== null) return fillGrid(row, col + 1)

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (const num of nums) {
      if (isValid(grid, num, row, col)) {
        grid[row][col] = num
        if (fillGrid(row, col + 1)) return true
        grid[row][col] = null
      }
    }
    return false
  }

  fillGrid(0, 0)
  return grid
}

export default function SpeedSudoku() {
  const [grid, setGrid] = useState<SudokuGrid>(() => generateSudoku())
  const [emptySubgrid, setEmptySubgrid] = useState<[number, number]>([0, 0])
  const [gameState, setGameState] = useState<"ready" | "playing" | "summary">("ready")
  const [totalCompleted, setTotalCompleted] = useState(0)
  const { score, streak, addScore, incrementStreak, reset: resetScore } = useGameScore()

  const handleTimeUp = useCallback(() => setGameState("summary"), [])
  const { formattedTime, timeLeft, reset: resetTimer, penalize } = useGameTimer({
    duration: GAME_DURATION,
    isActive: gameState === "playing",
    onTimeUp: handleTimeUp,
  })

  const initializeGame = useCallback(() => {
    const newGrid = generateSudoku()
    const emptyRow = Math.floor(Math.random() * 3) * 3
    const emptyCol = Math.floor(Math.random() * 3) * 3
    setEmptySubgrid([emptyRow, emptyCol])

    for (let i = emptyRow; i < emptyRow + 3; i++) {
      for (let j = emptyCol; j < emptyCol + 3; j++) {
        newGrid[i][j] = null
      }
    }

    setGrid(newGrid)
    setGameState("playing")
  }, [])

  useEffect(() => {
    if (gameState === "ready") {
      initializeGame()
    }
  }, [gameState, initializeGame])

  const isSubgridComplete = (grid: SudokuGrid): boolean => {
    const [startRow, startCol] = emptySubgrid
    for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
      for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
        if (grid[i][j] === null) return false
      }
    }
    return true
  }

  const isSubgridValid = (grid: SudokuGrid): boolean => {
    const [startRow, startCol] = emptySubgrid
    const subgrid = new Set<number>()
    for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
      for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
        const val = grid[i][j]
        if (val === null || subgrid.has(val)) return false
        subgrid.add(val)
      }
    }
    return true
  }

  const handleCellInput = (row: number, col: number, value: number | null) => {
    if (gameState !== "playing") return

    const newGrid = grid.map((r) => [...r])
    newGrid[row][col] = value
    setGrid(newGrid)

    if (isSubgridComplete(newGrid)) {
      if (isSubgridValid(newGrid)) {
        addScore(Math.max(0, timeLeft))
        incrementStreak()
        setTotalCompleted((prev) => prev + 1)
        if (timeLeft > 0) {
          initializeGame()
        } else {
          setGameState("summary")
        }
      } else {
        penalize(PENALTY_TIME)
      }
    }
  }

  const resetGame = () => {
    resetTimer(GAME_DURATION)
    resetScore()
    setTotalCompleted(0)
    setGameState("ready")
  }

  return (
    <GameContainer title="Speed Sudoku">
      <GameHUD formattedTime={formattedTime} score={score} streak={streak} />
      <AnimatePresence mode="wait">
        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-9 gap-1 mb-4"
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isEmptySubgrid =
                  rowIndex >= emptySubgrid[0] &&
                  rowIndex < emptySubgrid[0] + SUBGRID_SIZE &&
                  colIndex >= emptySubgrid[1] &&
                  colIndex < emptySubgrid[1] + SUBGRID_SIZE
                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-semibold rounded-lg
                                ${isEmptySubgrid ? "bg-blue-200 cursor-pointer text-blue-800" : "bg-opacity-20 bg-white text-white"}
                                ${(rowIndex + 1) % 3 === 0 ? "border-b-2 border-white" : ""}
                                ${(colIndex + 1) % 3 === 0 ? "border-r-2 border-white" : ""}`}
                    whileHover={isEmptySubgrid ? { scale: 1.1 } : {}}
                    whileTap={isEmptySubgrid ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (isEmptySubgrid) {
                        const newValue = cell === null ? 1 : cell < 9 ? cell + 1 : null
                        handleCellInput(rowIndex, colIndex, newValue)
                      }
                    }}
                  >
                    {cell || ""}
                  </motion.div>
                )
              })
            )}
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
