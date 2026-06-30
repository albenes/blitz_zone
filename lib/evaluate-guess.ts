export type LetterResult = "correct" | "present" | "absent"

const PRIORITY: Record<LetterResult, number> = {
  correct: 3,
  present: 2,
  absent: 1,
}

export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const results: LetterResult[] = Array(guess.length).fill("absent")
  const letterCount: Record<string, number> = {}

  for (const letter of target) {
    letterCount[letter] = (letterCount[letter] || 0) + 1
  }

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      results[i] = "correct"
      letterCount[guess[i]]--
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (results[i] !== "correct") {
      if (letterCount[guess[i]] > 0) {
        results[i] = "present"
        letterCount[guess[i]]--
      }
    }
  }

  return results
}

export function mergeLetterStates(
  existing: Record<string, LetterResult>,
  guess: string,
  target: string
): Record<string, LetterResult> {
  const results = evaluateGuess(guess, target)
  const merged = { ...existing }

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]
    const result = results[i]
    if (!merged[letter] || PRIORITY[result] > PRIORITY[merged[letter]]) {
      merged[letter] = result
    }
  }

  return merged
}

export function letterResultToColor(result: LetterResult | undefined): string {
  switch (result) {
    case "correct":
      return "bg-green-500"
    case "present":
      return "bg-yellow-500"
    case "absent":
      return "bg-gray-400"
    default:
      return "bg-opacity-20 bg-white"
  }
}
