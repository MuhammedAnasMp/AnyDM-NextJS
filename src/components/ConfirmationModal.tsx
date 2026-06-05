"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="w-full max-w-[360px] bg-[#1a1a19]/90 backdrop-blur-2xl rounded-xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 border ${
                  isDestructive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/10 text-white border-white/10'
                }`}>
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                  {title}
                </h2>
                <p className="text-xs text-[#c4c7c8]/60 leading-[1.65] mb-8 px-2 font-medium">
                  {message}
                </p>

                <div className="flex flex-col gap-2.5 w-full">
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`w-full py-2.5 px-8 rounded-lg font-bold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-lg ${
                      isDestructive 
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/10' 
                        : 'bg-white text-black hover:bg-[#eaeaea] shadow-white/5'
                    }`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#1c1b1b] text-[#c4c7c8]/80 border border-white/10 hover:border-white/20 font-bold text-xs hover:text-white hover:bg-[#20201f] transition-all duration-150 cursor-pointer"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
