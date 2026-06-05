"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DMRepliesPage() {
  const replyRules = [
    { trigger: 'Keyword: "price"', response: "Reply with catalog link + pricing breakdown.", active: true },
    { trigger: 'Keyword: "shipping"', response: "Reply with regional delivery times and fees.", active: true },
    { trigger: 'Keyword: "returns"', response: "Reply with 30-day money-back policy link.", active: false }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">DM Replies</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Configure direct reply triggers mapped directly to catalog keywords.
          </p>
        </div>
        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors">
          Add Reply Rule
        </button>
      </div>

      <div className="space-y-4">
        {replyRules.map((rule, idx) => (
          <div key={idx} className="glass-pane p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{rule.trigger}</h3>
              <p className="text-xs text-on-surface-variant/80">{rule.response}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
              rule.active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/10 text-on-surface-variant border border-white/5"
            }`}>
              {rule.active ? "Active" : "Paused"}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
