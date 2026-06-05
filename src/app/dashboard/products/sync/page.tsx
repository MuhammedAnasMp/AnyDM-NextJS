"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MediaSyncPage() {
  const syncItems = [
    { type: "Story", mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200", views: "1.2k views", date: "Synced 5m ago", isLinked: true },
    { type: "Reel", mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200", views: "15.4k views", date: "Synced 20m ago", isLinked: false },
    { type: "Post", mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200", views: "8.2k views", date: "Synced 1h ago", isLinked: true }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Media Sync</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Map stories, reels, and post media directly to checkout workflows.
          </p>
        </div>
        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors">
          Sync Instagram Feed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {syncItems.map((item, idx) => (
          <div key={idx} className="glass-pane rounded-xl overflow-hidden flex flex-col justify-between group">
            <div className="relative aspect-square bg-[#1c1b1b]">
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/60 text-[9px] font-bold uppercase tracking-wider text-white">
                {item.type}
              </div>
              <img src={item.mediaUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Sync Preview" />
            </div>
            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-white font-bold">{item.views}</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{item.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                item.isLinked ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/10 text-on-surface-variant border border-white/5"
              }`}>
                {item.isLinked ? "Linked" : "Unlinked"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
