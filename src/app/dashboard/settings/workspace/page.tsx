"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WorkspaceSettingsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Workspace Settings</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Configure global attributes, branding, and team permission tiers.
          </p>
        </div>
      </div>

      <div className="glass-pane p-6 rounded-xl space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Workspace Name</label>
          <input 
            type="text" 
            defaultValue="Alex Rivera Workspace"
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs text-white focus:outline-none w-full max-w-md focus:border-white/30"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Team Size Limit</label>
          <input 
            type="text" 
            defaultValue="5 members (Pro Plan)"
            disabled
            className="bg-white/5 border border-white/5 rounded-lg py-2 px-4 text-xs text-on-surface-variant/40 w-full max-w-md"
          />
        </div>

        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#eaeaea] transition-colors">
          Save Settings
        </button>
      </div>
    </motion.div>
  );
}
