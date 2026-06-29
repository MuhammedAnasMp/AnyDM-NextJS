"use client";

import React from "react";
import { motion } from "framer-motion";

export default function RevenuePage() {
  const chartPoints = [20, 35, 25, 45, 55, 40, 60, 75, 70, 90, 85, 95];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Revenue Growth</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Track gross merchandise sales volumes connected across linked checkout workflows.
          </p>
        </div>
        <div className="glass-pane px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Syncing Live Billing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-pane p-6 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">MRR</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">$24,800</h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium">+15.4% from last month</p>
        </div>
        <div className="glass-pane p-6 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">ARR</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">$297,600</h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Projection based on current runrate</p>
        </div>
        <div className="glass-pane p-6 rounded-xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Avg Order Value</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">$84.50</h3>
          <p className="text-xs text-on-surface-variant/60 mt-2">Calculated across 840 sales</p>
        </div>
      </div>

      {/* Revenue growth graph card */}
      <div className="glass-pane p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Annual Sales Trajectory</h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">Calculated in INR (₹)</p>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white">2026</span>
          </div>
        </div>

        {/* Custom SVG line chart */}
        <div className="h-64 w-full mt-6 relative">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            {/* Area Path */}
            <path
              d={`M 0 200 ${chartPoints.map((pt, idx) => `L ${(idx * 600) / 11} ${200 - pt}`).join(" ")} L 600 200 Z`}
              fill="url(#chartGradient)"
            />
            {/* Line Path */}
            <path
              d={chartPoints.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${(idx * 600) / 11} ${200 - pt}`).join(" ")}
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="chart-glow"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] text-on-surface-variant/60 pt-2 border-t border-white/5">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
