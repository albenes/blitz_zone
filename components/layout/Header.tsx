import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X } from "lucide-react"
import type { GameDefinition, GameId } from "@/lib/game-types"

interface HeaderProps {
  games: GameDefinition[]
  currentGameId: GameId
  onGameSelect: (id: GameId) => void
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
}

export function Header({
  games,
  currentGameId,
  onGameSelect,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 bg-indigo-900">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        >
          BlitzZone
        </Link>
        <div className="hidden md:flex space-x-4">
          {games.map((game) => (
            <Button
              key={game.id}
              variant="ghost"
              className={`text-white hover:text-blue-400 transition-colors ${
                currentGameId === game.id ? "text-blue-400" : ""
              }`}
              onClick={() => onGameSelect(game.id)}
            >
              {game.name}
            </Button>
          ))}
        </div>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" onClick={onMenuToggle}>
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-indigo-800 border-indigo-700">
              {games.map((game) => {
                const Icon = game.icon
                return (
                  <DropdownMenuItem
                    key={game.id}
                    onSelect={() => {
                      onGameSelect(game.id)
                      onMenuClose()
                    }}
                    className="text-white hover:bg-indigo-700"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="ml-2">{game.name}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
