import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-indigo-900 bg-opacity-80 backdrop-blur-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              BlitzZone
            </h2>
            <p className="text-xs text-gray-300">Fast-paced games for quick minds</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/about" className="text-xs text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-xs text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="text-xs text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} BlitzZone. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
