"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SpinToWinPage() {
  const [items, setItems] = useState([
    { label: "10% Discount", prob: "45%" },
    { label: "Free Shipping", prob: "35%" },
    { label: "Mystery Voucher", prob: "15%" },
    { label: "Jackpot Prize", prob: "5%" }
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Spin-to-Win Setup</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Configure direct-message spin wheel incentives to improve user checkout rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-pane p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white mb-4">Wheel Segments</h3>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <input 
                type="text" 
                value={item.label}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].label = e.target.value;
                  setItems(newItems);
                }}
                className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs text-white focus:outline-none flex-grow focus:border-white/30"
              />
              <input 
                type="text" 
                value={item.prob}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].prob = e.target.value;
                  setItems(newItems);
                }}
                className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs text-white focus:outline-none w-24 text-center focus:border-white/30"
              />
            </div>
          ))}
          <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors mt-4">
            Save Configuration
          </button>
        </div>

        {/* Visual Wheel Preview */}
        <div className="glass-pane p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-40 h-40 rounded-full border-4 border-white/20 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#333_0deg_90deg,#555_90deg_180deg,#777_180deg_270deg,#999_270deg_360deg)] opacity-40"></div>
            <div className="w-4 h-4 rounded-full bg-white z-10"></div>
          </div>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-6 font-bold">In-chat layout preview</p>
        </div>
      </div>
    </motion.div>
  );
}
