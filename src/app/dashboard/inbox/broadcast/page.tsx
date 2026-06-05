"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BroadcastPage() {
  const broadcasts = [
    { title: "Summer Launch Invitation", audience: "VIP Segment (322 users)", schedule: "June 6, 2026 at 10:00 AM", status: "Scheduled" },
    { title: "Flash Sale Promo", audience: "All Leads (840 users)", schedule: "Completed June 1, 2026", status: "Sent" }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Broadcast DM</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Send bulk direct messages to segmented groups with personalized parameters.
          </p>
        </div>
        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors">
          Create Broadcast
        </button>
      </div>

      <div className="space-y-4">
        {broadcasts.map((b, idx) => (
          <div key={idx} className="glass-pane p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{b.title}</h3>
              <p className="text-xs text-on-surface-variant/80">Audience: {b.audience} • Date: {b.schedule}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
              b.status === "Scheduled" ? "bg-white/10 text-on-surface-variant border border-white/5" : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
