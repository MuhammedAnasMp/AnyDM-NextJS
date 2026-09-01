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
      className="space-y-6 relative text-white font-sans"
    >
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="-z-10 pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Broadcast DM</h1>
          <p className="text-xs text-[#8e9192] mt-1">
            Send bulk direct messages to segmented groups with personalized parameters.
          </p>
        </div>
        <button className="bg-white text-zinc-950 text-xs font-semibold px-4 py-2 rounded hover:bg-zinc-200 transition-colors">
          Create Broadcast
        </button>
      </div>

      <div className="space-y-3">
        {broadcasts.map((b, idx) => (
          <div key={idx} className="bg-[#1c1b1b] border border-[#2a2a2a] p-4 rounded flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-white mb-1">{b.title}</h3>
              <p className="text-[11px] text-[#8e9192]">Audience: {b.audience} • Date: {b.schedule}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${b.status === "Scheduled" ? "bg-[#20201f] text-[#e5e2e1] border border-[#2a2a2a]" : "bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20"
              }`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
