import { describe, it, expect } from "vitest"
import {
  generateSudokuPuzzle,
  isSubgridComplete,
  isSubgridCorrect,
  isInEmptySubgrid,
  type SudokuGrid,
} from "@/lib/sudoku"

function isValidSudoku(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    const seen = new Set<number>()
    for (let col = 0; col < 9; col++) {
      const val = grid[row][col]
      if (val === null || val < 1 || val > 9 || seen.has(val)) return false
      seen.add(val)
    }
  }
  for (let col = 0; col < 9; col++) {
    const seen = new Set<number>()
    for (let row = 0; row < 9; row++) {
      const val = grid[row][col]
      if (val === null || seen.has(val!)) return false
      seen.add(val!)
    }
  }
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const seen = new Set<number>()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = grid[boxRow + i][boxCol + j]
          if (val === null || seen.has(val)) return false
          seen.add(val)
        }
      }
    }
  }
  return true
}

describe("generateSudokuPuzzle", () => {
  it("produces a valid complete solution", () => {
    const puzzle = generateSudokuPuzzle()
    expect(isValidSudoku(puzzle.solution)).toBe(true)
  })

  it("empties only the designated subgrid", () => {
    const puzzle = generateSudokuPuzzle()
    const [startRow, startCol] = puzzle.emptySubgrid

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const inEmpty = isInEmptySubgrid(i, j, puzzle.emptySubgrid)
        if (inEmpty) {
          expect(puzzle.grid[i][j]).toBeNull()
        } else {
          expect(puzzle.grid[i][j]).toBe(puzzle.solution[i][j])
        }
      }
    }

    expect(startRow % 3).toBe(0)
    expect(startCol % 3).toBe(0)
  })
})

describe("isSubgridComplete", () => {
  it("returns false when any cell in subgrid is empty", () => {
    const puzzle = generateSudokuPuzzle()
    expect(isSubgridComplete(puzzle.grid, puzzle.emptySubgrid)).toBe(false)
  })

  it("returns true when subgrid is fully filled", () => {
    const puzzle = generateSudokuPuzzle()
    const filled = puzzle.grid.map((row) => [...row])
    const [sr, sc] = puzzle.emptySubgrid
    for (let i = sr; i < sr + 3; i++) {
      for (let j = sc; j < sc + 3; j++) {
        filled[i][j] = puzzle.solution[i][j]
      }
    }
    expect(isSubgridComplete(filled, puzzle.emptySubgrid)).toBe(true)
  })
})

describe("isSubgridCorrect", () => {
  it("accepts the correct solution values", () => {
    const puzzle = generateSudokuPuzzle()
    const filled = puzzle.grid.map((row) => [...row])
    const [sr, sc] = puzzle.emptySubgrid
    for (let i = sr; i < sr + 3; i++) {
      for (let j = sc; j < sc + 3; j++) {
        filled[i][j] = puzzle.solution[i][j]
      }
    }
    expect(isSubgridCorrect(filled, puzzle.solution, puzzle.emptySubgrid)).toBe(true)
  })

  it("rejects values that differ from the solution", () => {
    const puzzle = generateSudokuPuzzle()
    const filled = puzzle.grid.map((row) => [...row])
    const [sr, sc] = puzzle.emptySubgrid
    for (let i = sr; i < sr + 3; i++) {
      for (let j = sc; j < sc + 3; j++) {
        filled[i][j] = puzzle.solution[i][j]
      }
    }
    const correct = puzzle.solution[sr][sc]!
    filled[sr][sc] = correct === 9 ? 1 : correct + 1
    expect(isSubgridCorrect(filled, puzzle.solution, puzzle.emptySubgrid)).toBe(false)
  })
})
