import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface NavigationConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function NavigationConfirmModal({ isOpen, onConfirm, onCancel }: NavigationConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="nav-confirm-title"
        >
          <motion.div
            className="bg-indigo-900 border border-indigo-700 text-white p-6 rounded-xl shadow-xl text-center mx-4 max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 id="nav-confirm-title" className="text-xl font-bold mb-3">
              Leave current game?
            </h2>
            <p className="text-gray-300 mb-6 text-sm">
              Your progress will be lost if you switch now.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-indigo-500 text-white hover:bg-indigo-800"
              >
                Keep Playing
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Leave Game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
