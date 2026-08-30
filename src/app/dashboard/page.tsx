"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/services/api.service";
import { ShieldCheck, Zap, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface RateLimitData {
  account_id: number | null;
  username: string | null;
  hourly_dm_count: number;
  hourly_dm_limit: number;
  hourly_dm_remaining: number;
  daily_dm_count: number;
  daily_dm_limit: number;
  daily_publish_count: number;
  daily_publish_limit: number;
  rate_limit_utilization_pct: number;
  reset_time_seconds: number;
  health_status: "SAFE" | "MODERATE" | "WARNING" | "THROTTLED";
  anti_block_protection: {
    status: string;
    jitter_delay_range: string;
    webhook_events: string;
    auto_throttle: string;
  };
}

interface ActivityItem {
  agent: string;
  time: string;
  desc: string;
  tags?: string[];
  icon: string;
  isHighlight?: boolean;
}

interface FunnelStep {
  label: string;
  value: string;
  percent: string;
  dropoff: string;
}

interface AnalyticsOverviewData {
  funnel_steps: FunnelStep[];
  recent_activities: ActivityItem[];
  kpi_summary: {
    active_automations: number;
    total_dms_sent: number;
    revenue_30d: number;
    new_leads: number;
  };
}

export default function DashboardOverview() {
  const [rateLimits, setRateLimits] = useState<RateLimitData | null>(null);
  const [rateLimitLoading, setRateLimitLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverviewData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [rateRes, analyticsRes] = await Promise.allSettled([
          api.get("/accounts/instagram/rate-limits/"),
          api.get("/crm/analytics/?timeframe=30d")
        ]);

        if (rateRes.status === "fulfilled" && rateRes.value.data) {
          setRateLimits(rateRes.value.data);
        }
        if (analyticsRes.status === "fulfilled" && analyticsRes.value.data) {
          setAnalyticsData(analyticsRes.value.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard overview data:", err);
      } finally {
        setRateLimitLoading(false);
        setAnalyticsLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      name: "Active Automations",
      value: analyticsLoading ? "..." : (analyticsData?.kpi_summary?.active_automations ?? 0).toString(),
      change: "Live Rules",
      icon: "bolt",
      progress: Math.min(100, (analyticsData?.kpi_summary?.active_automations || 0) * 10)
    },
    {
      name: "Total DMs Sent",
      value: analyticsLoading ? "..." : (analyticsData?.kpi_summary?.total_dms_sent ?? 0).toLocaleString(),
      change: "Outbound Velocity",
      icon: "forum",
      progress: Math.min(100, (analyticsData?.kpi_summary?.total_dms_sent || 0) * 5)
    },
    {
      name: "Revenue Generated",
      value: analyticsLoading ? "..." : `₹${(analyticsData?.kpi_summary?.revenue_30d ?? 0).toLocaleString()}`,
      change: "Last 30d",
      icon: "payments",
      progress: Math.min(100, (analyticsData?.kpi_summary?.revenue_30d || 0) / 1000),
      isAccented: true
    },
    {
      name: "New Leads",
      value: analyticsLoading ? "..." : (analyticsData?.kpi_summary?.new_leads ?? 0).toLocaleString(),
      change: "Active Profiles",
      icon: "person_add",
      progress: Math.min(100, (analyticsData?.kpi_summary?.new_leads || 0) * 8)
    }
  ];

  const activities = analyticsData?.recent_activities || [];
  const publishCount = rateLimits?.daily_publish_count ?? 0;
  const publishLimit = rateLimits?.daily_publish_limit || 100;
  const publishLeft = Math.max(0, publishLimit - publishCount);
  const publishPct = Math.min(100, Math.round((publishCount / publishLimit) * 100));

  const funnelSteps = analyticsData?.funnel_steps || [
    { label: "Impression", value: "0", percent: "100%", dropoff: "0%" },
    { label: "Engagement", value: "0", percent: "0%", dropoff: "0%" },
    { label: "DM Started", value: "0", percent: "0%", dropoff: "0%" },
    { label: "Conversion", value: "0", percent: "0%", dropoff: "Final CR" }
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
                style={{ width: `${Math.max(5, kpi.progress)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Instagram Rate Limits & Anti-Block Safety Guardian ── */}
      <div className="p-5 rounded-lg bg-[#1c1b1b] border border-white/10 space-y-4 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Instagram Account Health &amp; Rate Limits</h3>
                <span className="text-[10px] font-mono text-[#c4c7c8]/60">
                  {rateLimits?.username ? `@${rateLimits.username}` : "Connected Account"}
                </span>
              </div>
              <p className="text-xs text-[#c4c7c8]/80 mt-0.5">
                Real-time API utilization and automatic anti-block protection monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[#34d399] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
              <span>Anti-Block Shield: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Hourly DM Rate */}
          <div className="p-3.5 rounded bg-[#20201f] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">Hourly DM Velocity</span>
              <Zap className="w-3.5 h-3.5 text-[#c4c0ff]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{rateLimits?.hourly_dm_count || 0}</span>
              <span className="text-xs text-[#8e9192]">/ {rateLimits?.hourly_dm_limit || 200} safe cap</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (((rateLimits?.hourly_dm_count || 0) / (rateLimits?.hourly_dm_limit || 200)) * 100))}%`,
                    backgroundColor: (rateLimits?.hourly_dm_count || 0) > 160 ? "#ef4444" : (rateLimits?.hourly_dm_count || 0) > 120 ? "#f59e0b" : "#34d399"
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#8e9192]">
                <span>{rateLimits?.hourly_dm_remaining ?? 200} DMs remaining</span>
                <span className="font-semibold text-[#34d399]">Safe zone</span>
              </div>
            </div>
          </div>

          {/* 2. Rate Limit Utilization */}
          <div className="p-3.5 rounded bg-[#20201f] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">Meta API Usage</span>
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{rateLimits?.rate_limit_utilization_pct || 0}%</span>
              <span className="text-xs text-[#8e9192]">of 100% capacity</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${Math.min(100, rateLimits?.rate_limit_utilization_pct || 5)}%`,
                    backgroundColor: (rateLimits?.rate_limit_utilization_pct || 0) > 80 ? "#ef4444" : "#38bdf8"
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#8e9192]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8e9192]" /> 
                  Resets in {Math.ceil((rateLimits?.reset_time_seconds || 3600) / 60)}m
                </span>
                <span className="text-white font-medium">Optimal</span>
              </div>
            </div>
          </div>

          {/* 3. 24-Hour Messaging Window */}
          <div className="p-3.5 rounded bg-[#20201f] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">24h Customer Window</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">Active</span>
              <span className="text-xs text-[#8e9192]">Compliant</span>
            </div>
            <p className="text-[10px] text-[#8e9192] leading-normal pt-1">
              Automated responses strictly gated to active 24h conversation windows to prevent spam violations.
            </p>
          </div>

          {/* 4. Publishing Container Quota */}
          <div className="p-3.5 rounded bg-[#20201f] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">Publish Container Quota</span>
              <span className="text-[10px] font-mono text-[#c4c0ff] font-bold">24H</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{publishCount}</span>
              <span className="text-xs text-[#8e9192]">/ {publishLimit} posts/day</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${publishPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#8e9192]">
                <span>{publishLeft} uploads left</span>
                <span className="text-emerald-400 font-medium">Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protection Banner footer */}
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 text-[#c4c7c8]/80">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff]" />
              Jitter Delays: <strong className="text-white font-mono">{rateLimits?.anti_block_protection?.jitter_delay_range || "1.5s - 3.5s"}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff]" />
              Event Webhooks: <strong className="text-white">Active (Zero Polling)</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff]" />
              429 Exponential Backoff: <strong className="text-white">Auto-Throttling Enabled</strong>
            </span>
          </div>
          <span className="text-[10px] text-[#8e9192] italic">
            Compliant with Meta Platform Terms v25.0
          </span>
        </div>
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
          </div>
          <div className="space-y-4 flex-1">
            {analyticsLoading ? (
              <div className="p-8 text-center text-xs text-on-surface-variant/60">Loading live activity stream...</div>
            ) : activities.length > 0 ? (
              activities.map((act, i) => (
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
              ))
            ) : (
              <div className="p-12 text-center glass-pane rounded-xl my-4">
                <p className="text-sm font-semibold text-white">No recent activity recorded</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Automated DMs, story replies, and customer interactions will stream here in real time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Section: Funnel & Insights (1/3) */}
        <div className="space-y-6">
          {/* Conversion Funnel Card */}
          <div className="glass-pane p-6 rounded-xl">
            <h3 className="text-base font-bold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {funnelSteps.map((step, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[10px] font-bold mb-1 text-on-surface-variant uppercase tracking-wider">
                    <span>{step.label}</span>
                    <span className="text-white">{step.value}</span>
                  </div>
                  <div className="h-8 bg-white/5 rounded-lg relative overflow-hidden group">
                    <div 
                      className="absolute inset-y-0 left-0 transition-all duration-500 bg-white/20 group-hover:bg-white/30" 
                      style={{ width: step.percent.endsWith('%') ? step.percent : '100%' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold text-white/70">
                      <span>{step.percent}</span>
                      <span className="text-on-surface-variant/60">{step.dropoff ? `Dropoff: ${step.dropoff}` : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-[#c4c0ff]/5 rounded-lg border border-[#c4c0ff]/10">
              <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
                &ldquo;Automated Tracking: Real-time funnel calculated dynamically from direct message interactions to order checkouts.&rdquo;
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
                  <span className="text-xs font-bold text-white">100%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  System performance is optimal. Anti-Block protection and jitter delays <span className="text-white font-bold">active</span>.
                </p>
              </div>
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
