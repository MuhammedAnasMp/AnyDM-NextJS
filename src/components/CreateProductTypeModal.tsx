"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import InstagramIcon from "./ui/InstagramIcon";

interface CreateProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNormal?: () => void;
  onSelectInstagram?: () => void;
}

export default function CreateProductTypeModal({
  isOpen,
  onClose,
  onSelectNormal,
  onSelectInstagram,
}: CreateProductTypeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNormal = () => {
    onClose();
    if (onSelectNormal) {
      onSelectNormal();
    } else {
      router.push("/dashboard/products/catalog/create");
    }
  };

  const handleInstagram = () => {
    onClose();
    if (onSelectInstagram) {
      onSelectInstagram();
    } else {
      router.push("/dashboard/products/catalog?import=instagram");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop Click to Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            data-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden p-6 text-[#e5e2e1] font-sans z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#20201f]">
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  Create Product
                </h3>
                <p className="text-xs text-[#c4c7c8] mt-0.5">
                  Select how you would like to create your product
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8e9192] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="mt-5 space-y-3">
              {/* Option 1: Normal Product */}
              <button
                onClick={handleNormal}
                className="w-full text-left p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] hover:border-white/30 hover:bg-[#222121] transition-all group flex items-start gap-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      Normal Product
                    </h4>
                    <ArrowRight className="w-4 h-4 text-[#8e9192] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-[#8e9192] mt-1 line-clamp-2">
                    Create digital downloads, physical items, courses, or services from scratch.
                  </p>
                </div>
              </button>

              {/* Option 2: Create from Instagram */}
              <button
                onClick={handleInstagram}
                className="w-full text-left p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] hover:border-pink-500/40 hover:bg-[#222121] transition-all group flex items-start gap-3.5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#141414] rounded-[6px] flex items-center justify-center">
                    <InstagramIcon className="w-5 h-5 text-pink-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 group-hover:text-pink-400 transition-colors">
                      Create from Instagram
                    </h4>
                    <ArrowRight className="w-4 h-4 text-[#8e9192] group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-[#8e9192] mt-1 line-clamp-2">
                    Import media, captions, and details directly from your published Instagram posts or reels.
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
