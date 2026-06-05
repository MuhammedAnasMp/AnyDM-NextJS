"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const kpis = [
    { name: "Active Automations", value: "12", change: "+2 today", icon: "bolt", progress: 75 },
    { name: "Total DMs Sent", value: "8.4k", change: "12% growth", icon: "forum", progress: 45 },
    { name: "Revenue Generated", value: "$12,402", change: "Last 30d", icon: "payments", progress: 60, isAccented: true },
    { name: "New Leads", value: "342", change: "Conversion: 4.2%", icon: "person_add", progress: 30 }
  ];

  const activities = [
    {
      agent: "Outreach Bot Alpha",
      time: "Just now",
      desc: 'Successfully engaged with @design_studio via Instagram Direct. AI persona "Supportive Guide" active.',
      tags: ["Sentiment: Positive", "Intent: Inquiry"],
      icon: "auto_awesome"
    },
    {
      agent: "Lead Qualification",
      time: "14m ago",
      desc: 'New high-intent lead identified: Sarah Chen (Marketing Director). Lead score updated to 88/100.',
      icon: "person"
    },
    {
      agent: "Conversion Event",
      time: "1h ago",
      desc: "Direct message automation resulted in a successful checkout for Enterprise Plan.",
      icon: "payments",
      isHighlight: true
    },
    {
      agent: "Routine Sync",
      time: "3h ago",
      desc: "Contact database synchronized with CRM. 1,240 records updated.",
      icon: "schedule"
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">Welcome back. Your AI agents are active.</p>
        </div>
        <div className="glass-pane px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#c4c0ff] animate-pulse shadow-[0_0_8px_rgba(196,192,255,0.6)]"></span>
          <span>AI Processing Active</span>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div 
            key={index}
            className="glass-pane p-6 rounded-xl hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-4xl">{kpi.icon}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4">{kpi.name}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-white">{kpi.value}</span>
              <span className="text-[10px] text-on-surface-variant opacity-60 pb-1">{kpi.change}</span>
            </div>
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${kpi.isAccented ? "bg-[#c4c0ff] shadow-[0_0_10px_rgba(196,192,255,0.4)]" : "bg-white"}`} 
                style={{ width: `${kpi.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Activity & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed (2/3) */}
        <div className="lg:col-span-2 glass-pane p-6 rounded-xl flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">stream</span>
              <span>Activity Feed</span>
            </h3>
            <button className="text-xs text-on-surface-variant hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
              View all logs
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {activities.map((act, i) => (
              <div 
                key={i} 
                className="group flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
              >
                <div 
                  className={`w-10 h-10 rounded-full glass-pane flex items-center justify-center shrink-0 border-white/20 ${
                    act.isHighlight ? "text-[#c4c0ff] border-[#c4c0ff]/20" : "text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{act.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-white">{act.agent}</p>
                    <span className="text-[10px] text-on-surface-variant opacity-50 uppercase tracking-wider">{act.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{act.desc}</p>
                  {act.tags && (
                    <div className="mt-2 flex gap-2">
                      {act.tags.map((tag, idx) => (
                        <span key={idx} className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-on-surface-variant/80 border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Section: Funnel & Insights (1/3) */}
        <div className="space-y-6">
          {/* Conversion Funnel Card */}
          <div className="glass-pane p-6 rounded-xl">
            <h3 className="text-base font-bold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {[
                { name: "Impressions", val: "24,500", percent: 100, color: "bg-white/10" },
                { name: "Engagements", val: "3,120", percent: 65, percentLabel: "12.7%", color: "bg-white/20" },
                { name: "Replies", val: "840", percent: 35, percentLabel: "3.4%", color: "bg-white/35" },
                { name: "Conversions", val: "92", percent: 15, percentLabel: "0.4%", color: "bg-white" }
              ].map((step, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[10px] font-bold mb-1 text-on-surface-variant uppercase tracking-wider">
                    <span>{step.name}</span>
                    <span className="text-white">{step.val}</span>
                  </div>
                  <div className="h-8 bg-white/5 rounded-lg relative overflow-hidden group">
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all duration-500 group-hover:opacity-90 ${step.color}`} 
                      style={{ width: `${step.percent}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center px-3 text-[10px] font-bold text-white/50">
                      {step.percentLabel || "100%"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-[#c4c0ff]/5 rounded-lg border border-[#c4c0ff]/10">
              <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
                &ldquo;AI Insight: Your reply rate is 2% higher during weekend mornings. Consider scheduling more outbound spikes then.&rdquo;
              </p>
            </div>
          </div>

          {/* AI Agent Efficiency */}
          <div className="glass-pane p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#c4c0ff]/10 blur-2xl rounded-full transition-transform group-hover:scale-150 duration-700"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c4c7c8]/80 mb-4">AI Agent Efficiency</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-white/5" cx="18" cy="18" fill="none" r="16" strokeWidth="2"></circle>
                  <circle className="stroke-white" cx="18" cy="18" fill="none" r="16" strokeDasharray="82, 100" strokeWidth="2"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">82%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  System performance is optimal. Average response latency: <span className="text-white font-bold">2.4s</span>
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Promo */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-surface-container-high to-surface border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent)] pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white tracking-widest uppercase mb-1">Scale Higher</p>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Unlock Unlimited AI Agents &amp; advanced sentiment triggers.</p>
              <button className="w-full py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-[#eaeaea] transition-colors shadow-lg active:scale-95 transition-transform duration-200">
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-200 group">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">add</span>
        </button>
      </div>
    </motion.div>
  );
}
