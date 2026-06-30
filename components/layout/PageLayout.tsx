import Link from "next/link"
import type { ReactNode } from "react"

interface PageLayoutProps {
  title: string
  children: ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <header className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
        >
          BlitzZone
        </Link>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
          {title}
        </h1>
        <div className="prose prose-invert text-gray-200 space-y-4">{children}</div>
      </main>
    </div>
  )
}
