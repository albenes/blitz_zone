interface LetterTileProps {
  letter: string
  colorClass: string
  isFlipped: boolean
  colIndex: number
}

export function LetterTile({ letter, colorClass, isFlipped, colIndex }: LetterTileProps) {
  return (
    <div
      className="w-10 h-10 sm:w-12 sm:h-12"
      style={{ perspective: 600 }}
      role="gridcell"
      aria-label={letter || "empty"}
    >
      <div
        className={`w-full h-full rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold transition-transform duration-500 ${colorClass}`}
        style={{
          transform: isFlipped ? "rotateX(360deg)" : "rotateX(0deg)",
          transformStyle: "preserve-3d",
          transitionDelay: isFlipped ? `${colIndex * 80}ms` : "0ms",
        }}
      >
        {letter}
      </div>
    </div>
  )
}
