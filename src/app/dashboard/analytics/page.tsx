"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const chartBars = [
    { height: "h-[60%]" },
    { height: "h-[85%]" },
    { height: "h-[45%]" },
    { height: "h-[92%]", showLabel: true },
    { height: "h-[70%]" },
    { height: "h-[65%]" },
    { height: "h-[78%]" },
    { height: "h-[50%]" },
    { height: "h-[95%]" }
  ];

  const funnelSteps = [
    { label: "Impression", value: "1.2M", percent: "100%", dropoff: "12%", border: "border-primary/40", delay: 0 },
    { label: "Engagement", value: "840K", percent: "12.7%", dropoff: "28%", border: "border-primary/60", delay: 0.1 },
    { label: "DM Started", value: "210K", percent: "3.4%", dropoff: "45%", border: "border-primary/80", delay: 0.2 },
    { label: "Conversion", value: "42.5K", percent: "3.5%", dropoff: "Final CR", border: "border-primary", delay: 0.3 }
  ];

  const autHealth = [
    { name: "Global Onboarding DM", status: "Active", stat: "1,202 triggers / hr", ok: true },
    { name: "Cart Abandonment Sequence", status: "Active", stat: "458 triggers / hr", ok: true },
    { name: "Loyalty Reward Dispatch", status: "Paused", stat: "Manual check required", ok: false }
  ];

  const topProducts = [
    { name: "Elite Pass", sales: "$12.4k", growth: "+12%" },
    { name: "Starter Kit", sales: "$8.2k", growth: "+5%" },
    { name: "Founders Coin", sales: "$24.1k", growth: "+48%" },
    { name: "Bundle Pack", sales: "$5.6k", growth: "-2%" }
  ];

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Engine</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Comprehensive real-time tracking for Project Alpha’s funnel performance and user engagement metrics.
          </p>
        </div>
        <div className="glass-pane px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]"></span>
          <span>Live Feed</span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart: DM Open Rates (2/3) */}
        <div className="col-span-12 lg:col-span-8 glass-pane p-6 rounded-2xl relative overflow-hidden h-[400px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-white">DM Open Rates</h3>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">Real-time engagement velocity</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">94.2%</span>
              <p className="text-[10px] text-white/60 mt-0.5">+2.4% from yesterday</p>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex-1 flex items-end gap-2 px-4 group mt-6 h-full min-h-[180px]">
            {chartBars.map((bar, i) => (
              <div 
                key={i} 
                className={`w-full bg-white/10 rounded-t-lg transition-all duration-700 hover:bg-white/30 relative ${bar.height}`}
              >
                {bar.showLabel && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-pane px-2 py-1 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white font-bold">
                    Peak Hour
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Score Radial Chart (1/3) */}
        <div className="col-span-12 lg:col-span-4 glass-pane p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Engagement Score</h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">Alpha Weighted Average</p>
            
            {/* Radial SVG Widget */}
            <div className="relative w-40 h-40 mx-auto mt-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                <circle 
                  className="text-white chart-glow" 
                  cx="50" 
                  cy="50" 
                  fill="none" 
                  r="42" 
                  stroke="currentColor" 
                  strokeDasharray="264" 
                  strokeDashoffset="35" 
                  strokeWidth="6"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">88</span>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">OPTIMAL</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Response Speed</span>
                <span className="text-white font-bold">1.2m</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-[90%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">User Sentiment</span>
                <span className="text-white font-bold">Positive</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel Section */}
        <div className="col-span-12 glass-pane p-6 rounded-2xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Conversion Funnel</h3>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">From Reach to Successful Checkout</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="bg-white/5 px-3 py-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors">
                30 Days
              </button>
              <button className="text-white border border-white/20 px-3 py-1.5 rounded bg-white/10 font-semibold">
                90 Days
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {funnelSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: step.delay }}
                className="flex flex-col gap-2"
              >
                <div className={`h-24 glass-pane rounded-xl flex flex-col items-center justify-center border-l-4 ${step.border}`}>
                  <span className="text-xl font-extrabold text-white">{step.value}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">{step.label}</span>
                </div>
                <p className="text-center text-[10px] text-on-surface-variant/40 mt-1">
                  {idx === 3 ? "Final CR" : `Drop-off: ${step.dropoff}`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Automation Health & Top Products */}
        <div className="col-span-12 lg:col-span-6 glass-pane p-6 rounded-2xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Automation Health</h4>
          <div className="space-y-2">
            {autHealth.map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-xl ${
                    item.ok ? "text-white/40 group-hover:text-white" : "text-red-400/40 group-hover:text-red-400"
                  } transition-colors`}>
                    {item.ok ? "robot_2" : "error_outline"}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{item.status} • {item.stat}</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-lg ${item.ok ? "text-white" : "text-red-400"}`}>
                  {item.ok ? "check_circle" : "pause_circle"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-pane p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 z-10">Top Products</h4>
          
          <div className="grid grid-cols-2 gap-4 z-10">
            {topProducts.map((prod, i) => (
              <div key={i} className="p-4 glass-pane rounded-xl hover:border-white/20 transition-all duration-300">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">{prod.name}</p>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold text-white">{prod.sales}</span>
                  <span className={`text-[10px] font-bold ${prod.growth.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                    {prod.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
