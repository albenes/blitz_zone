import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Home } from "lucide-react"
import type { GameDefinition, GameId } from "@/lib/game-types"

interface HeaderProps {
  games: GameDefinition[]
  activeGameId: GameId | null
  onNavigate: (id: GameId | null) => void
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
}

export function Header({
  games,
  activeGameId,
  onNavigate,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 bg-indigo-900">
      <nav
        className="container mx-auto px-4 py-4 flex justify-between items-center"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onNavigate(null)
          }}
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        >
          BlitzZone
        </Link>
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            className={`text-white hover:text-blue-400 transition-colors ${
              activeGameId === null ? "text-blue-400" : ""
            }`}
            onClick={() => onNavigate(null)}
            aria-label="Home"
            aria-current={activeGameId === null ? "page" : undefined}
          >
            <Home className="w-4 h-4 mr-1" aria-hidden="true" />
            Home
          </Button>
          {games.map((game) => (
            <Button
              key={game.id}
              variant="ghost"
              className={`text-white hover:text-blue-400 transition-colors ${
                activeGameId === game.id ? "text-blue-400" : ""
              }`}
              onClick={() => onNavigate(game.id)}
              aria-current={activeGameId === game.id ? "page" : undefined}
            >
              {game.name}
            </Button>
          ))}
        </div>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" onClick={onMenuToggle} aria-label="Open menu">
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-indigo-800 border-indigo-700">
              <DropdownMenuItem
                onSelect={() => {
                  onNavigate(null)
                  onMenuClose()
                }}
                className="text-white hover:bg-indigo-700"
              >
                <Home className="w-4 h-4" />
                <span className="ml-2">Home</span>
              </DropdownMenuItem>
              {games.map((game) => {
                const Icon = game.icon
                return (
                  <DropdownMenuItem
                    key={game.id}
                    onSelect={() => {
                      onNavigate(game.id)
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
