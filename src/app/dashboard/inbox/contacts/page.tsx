"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ContactsPage() {
  const contacts = [
    { name: "Jordan Lee", username: "@jordan_creates", score: 98, tier: "VIP Client" },
    { name: "Morgan Wright", username: "@morgan_w", score: 42, tier: "Lead" },
    { name: "Casey Smith", username: "@casey_tech", score: 81, tier: "Active Prospect" }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Contacts & Leads</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Segment and qualify your social leads directly synced from active message threads.
          </p>
        </div>
      </div>

      <div className="glass-pane rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-on-surface-variant font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {contacts.map((c, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                <td className="px-6 py-4 text-on-surface-variant">{c.username}</td>
                <td className="px-6 py-4 text-center font-bold text-white">{c.score} / 100</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-block px-2.5 py-1 bg-white/5 rounded-full border border-white/10 font-bold uppercase tracking-wider text-[9px] text-[#c4c0ff]">
                    {c.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
