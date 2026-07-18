"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = "error", isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const colors = {
    error: "bg-red-500",
    success: "bg-green-500",
    info: "bg-[#605ca2]"
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    info: <Info className="w-4 h-4 text-[#c4c0ff]" />
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98, x: 20, transition: { duration: 0.2 } }}
          className="fixed top-20 right-8 z-[9999] pointer-events-none"
        >
          <div className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-xl py-3 pl-4 pr-3 flex items-center gap-3 min-w-[320px] max-w-[420px] relative overflow-hidden group">
             {/* Left accent glow */}
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors[type]} opacity-50`} />
             
             <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                   {icons[type]}
                </div>
             </div>

             <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-snug tracking-tight">
                   {message}
                </p>
             </div>

             <button 
               onClick={onClose}
               className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
             >
               <X className="w-3.5 h-3.5" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
