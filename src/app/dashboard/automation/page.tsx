"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Sparkles, ArrowLeft } from "lucide-react";

export default function AutomationPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative px-4 overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#c4c0ff]/5 blur-[120px] pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-pane max-w-lg w-full p-8 md:p-10 rounded-2xl flex flex-col items-center text-center relative z-10 border border-white/10"
      >
        {/* Animated Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center shadow-lg relative group mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
          <Zap className="w-8 h-8 text-white relative z-10 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 justify-center mb-3">
          <span>Instagram Automations</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h1>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Coming Soon</span>
        </div>

        {/* Description */}
        <p className="text-sm text-on-surface-variant/80 leading-relaxed max-w-sm mb-8">
          We are redesigning the automation dashboard to bring you fully integrated, visual canvas builder support, live debug stream, and detailed metric triggers.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/dashboard/automations"
            className="flex-1 py-3 px-6 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Try Workflow Builder</span>
          </Link>
          <Link 
            href="/dashboard"
            className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
