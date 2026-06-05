"use client";

import React from "react";
import { motion } from "framer-motion";

export default function EngagementScoringPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Engagement Scoring</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Re-adjust weights used by the lead scoring logic to rank prospective buyers.
          </p>
        </div>
      </div>

      <div className="glass-pane p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Message Count Weight</label>
          <input 
            type="number" 
            defaultValue="40"
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs text-white focus:outline-none w-full max-w-md focus:border-white/30"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-2">Checkout Click Weight</label>
          <input 
            type="number" 
            defaultValue="60"
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs text-white focus:outline-none w-full max-w-md focus:border-white/30"
          />
        </div>

        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors pt-2">
          Update Weights
        </button>
      </div>
    </motion.div>
  );
}
