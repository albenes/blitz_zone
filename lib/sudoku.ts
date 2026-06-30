export type SudokuGrid = (number | null)[][]

export interface SudokuPuzzle {
  grid: SudokuGrid
  solution: SudokuGrid
  emptySubgrid: [number, number]
}

const GRID_SIZE = 9
const SUBGRID_SIZE = 3

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function isValidPlacement(grid: SudokuGrid, num: number, row: number, col: number): boolean {
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

function fillGrid(grid: SudokuGrid, row: number, col: number): boolean {
  if (col === GRID_SIZE) {
    col = 0
    row++
    if (row === GRID_SIZE) return true
  }

  if (grid[row][col] !== null) return fillGrid(grid, row, col + 1)

  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const num of nums) {
    if (isValidPlacement(grid, num, row, col)) {
      grid[row][col] = num
      if (fillGrid(grid, row, col + 1)) return true
      grid[row][col] = null
    }
  }
  return false
}

function generateSolution(): SudokuGrid {
  const grid: SudokuGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null))
  fillGrid(grid, 0, 0)
  return grid
}

export function generateSudokuPuzzle(): SudokuPuzzle {
  const solution = generateSolution()
  const emptyRow = Math.floor(Math.random() * 3) * SUBGRID_SIZE
  const emptyCol = Math.floor(Math.random() * 3) * SUBGRID_SIZE

  const grid = solution.map((row) => [...row])
  for (let i = emptyRow; i < emptyRow + SUBGRID_SIZE; i++) {
    for (let j = emptyCol; j < emptyCol + SUBGRID_SIZE; j++) {
      grid[i][j] = null
    }
  }

  return { grid, solution, emptySubgrid: [emptyRow, emptyCol] }
}

export function isSubgridComplete(grid: SudokuGrid, emptySubgrid: [number, number]): boolean {
  const [startRow, startCol] = emptySubgrid
  for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
    for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
      if (grid[i][j] === null) return false
    }
  }
  return true
}

export function isSubgridCorrect(
  grid: SudokuGrid,
  solution: SudokuGrid,
  emptySubgrid: [number, number]
): boolean {
  const [startRow, startCol] = emptySubgrid
  for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
    for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
      if (grid[i][j] !== solution[i][j]) return false
    }
  }
  return true
}

export function isInEmptySubgrid(
  row: number,
  col: number,
  emptySubgrid: [number, number]
): boolean {
  const [startRow, startCol] = emptySubgrid
  return (
    row >= startRow &&
    row < startRow + SUBGRID_SIZE &&
    col >= startCol &&
    col < startCol + SUBGRID_SIZE
  )
}
