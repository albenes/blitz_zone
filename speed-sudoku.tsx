"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const GRID_SIZE = 9
const SUBGRID_SIZE = 3
const GAME_DURATION = 90 // 90 seconds
const PENALTY_TIME = 5 // 5 seconds penalty for incorrect input

type SudokuGrid = (number | null)[][]

const generateSudoku = (): SudokuGrid => {
  const grid: SudokuGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))

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
    for (let num of nums) {
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

const SpeedSudoku: React.FC = () => {
  const [grid, setGrid] = useState<SudokuGrid>(() => generateSudoku())
  const [emptySubgrid, setEmptySubgrid] = useState<[number, number]>([0, 0])
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [score, setScore] = useState(0)
  const [totalCompleted, setTotalCompleted] = useState(0)

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
    setGameState('playing')
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('lost')
    }
  }, [timeLeft, gameState])

  const handleCellInput = (row: number, col: number, value: number) => {
    if (gameState !== 'playing') return

    const newGrid = [...grid.map(row => [...row])]
    newGrid[row][col] = value

    if (!isValidMove(newGrid, row, col, value)) {
      setTimeLeft(Math.max(0, timeLeft - PENALTY_TIME))
      newGrid[row][col] = null // Reset the cell if the move is invalid
    }

    setGrid(newGrid)

    if (isSubgridComplete()) {
      setScore(score + Math.max(0, timeLeft))
      setTotalCompleted(totalCompleted + 1)
      initializeGame()
    }
  }

  const isValidMove = (grid: SudokuGrid, row: number, col: number, value: number): boolean => {
    // Check row
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== col && grid[row][i] === value) return false
    }

    // Check column
    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== row && grid[i][col] === value) return false
    }

    // Check subgrid
    const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE
    const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE
    for (let i = 0; i < SUBGRID_SIZE; i++) {
      for (let j = 0; j < SUBGRID_SIZE; j++) {
        if (startRow + i !== row && startCol + j !== col && grid[startRow + i][startCol + j] === value) return false
      }
    }

    return true
  }

  const isSubgridComplete = (): boolean => {
    const [startRow, startCol] = emptySubgrid
    for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
      for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
        if (grid[i][j] === null) return false
      }
    }
    return true
  }

  const startGame = () => {
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setTotalCompleted(0)
    setGameState('playing')
    initializeGame()
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Speed Sudoku</h1>
      <div className="mb-4 flex justify-between w-full max-w-md">
        <div className="text-xl font-semibold text-white">Time: {timeLeft}s</div>
        <div className="text-xl font-semibold text-white">Score: {score}</div>
      </div>
      <AnimatePresence mode="wait">
        {gameState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="grid grid-cols-9 gap-1 mb-4 filter blur-sm">
              {Array(GRID_SIZE).fill(null).map((_, rowIndex) =>
                Array(GRID_SIZE).fill(null).map((_, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-semibold rounded-lg
                                bg-gray-200
                                ${(rowIndex + 1) % 3 === 0 ? 'border-b-2 border-gray-600' : ''}
                                ${(colIndex + 1) % 3 === 0 ? 'border-r-2 border-gray-600' : ''}`}
                  >
                    {Math.floor(Math.random() * 9) + 1}
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={startGame}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Start Game
            </Button>
          </motion.div>
        )}
        {gameState === 'playing' && (
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
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-semibold rounded-lg
                                ${isEmptySubgrid ? 'bg-blue-200 cursor-pointer' : 'bg-gray-200'}
                                ${(rowIndex + 1) % 3 === 0 ? 'border-b-2 border-gray-600' : ''}
                                ${(colIndex + 1) % 3 === 0 ? 'border-r-2 border-gray-600' : ''}`}
                    whileHover={isEmptySubgrid ? { scale: 1.1 } : {}}
                    whileTap={isEmptySubgrid ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (isEmptySubgrid) {
                        const newValue = ((cell || 0) % 9) + 1
                        handleCellInput(rowIndex, colIndex, newValue)
                      }
                    }}
                  >
                    {cell || ''}
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-2xl font-bold mb-4 text-white">
              {gameState === 'won' ? 'Congratulations!' : 'Time\'s up!'}
            </p>
            <p className="text-xl mb-4 text-white">
              Final Score: {score}<br />
              Completed Grids: {totalCompleted}
            </p>
            <Button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Play Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpeedSudoku