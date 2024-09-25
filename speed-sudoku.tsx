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
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'summary'>('ready')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
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
    if (gameState === 'ready') {
      initializeGame()
    }
  }, [gameState, initializeGame])

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('summary')
    }
  }, [timeLeft, gameState])

  const handleCellInput = (row: number, col: number, value: number | null) => {
    if (gameState !== 'playing') return

    const newGrid = [...grid.map(row => [...row])]
    newGrid[row][col] = value

    setGrid(newGrid)

    if (isSubgridComplete(newGrid)) {
      if (isSubgridValid(newGrid)) {
        setScore(prevScore => prevScore + Math.max(0, timeLeft))
        setStreak(prevStreak => prevStreak + 1)
        setTotalCompleted(prevTotal => prevTotal + 1)
        if (timeLeft > 0) {
          initializeGame()
        } else {
          setGameState('summary')
        }
      } else {
        setTimeLeft(Math.max(0, timeLeft - PENALTY_TIME))
      }
    }
  }

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
    const subgrid = new Set()
    for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
      for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
        if (subgrid.has(grid[i][j])) return false
        subgrid.add(grid[i][j])
      }
    }
    return true
  }

  const resetGame = () => {
    setTimeLeft(GAME_DURATION)
    setScore(0)
    setStreak(0)
    setTotalCompleted(0)
    setGameState('ready')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white p-4">
      <motion.h1
        className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Speed Sudoku
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
      <AnimatePresence mode="wait">
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
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-semibold rounded-lg
                                ${isEmptySubgrid ? 'bg-blue-200 cursor-pointer text-blue-800' : 'bg-opacity-20 bg-white text-white'}
                                ${(rowIndex + 1) % 3 === 0 ? 'border-b-2 border-white' : ''}
                                ${(colIndex + 1) % 3 === 0 ? 'border-r-2 border-white' : ''}`}
                    whileHover={isEmptySubgrid ? { scale: 1.1 } : {}}
                    whileTap={isEmptySubgrid ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (isEmptySubgrid) {
                        const newValue = cell === null ? 1 : cell < 9 ? cell + 1 : null
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
        {gameState === 'summary' && (
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
              <p className="text-xl mb-2">Streak: {streak}</p>
              <p className="text-xl mb-4">Grids Completed: {totalCompleted}</p>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpeedSudoku