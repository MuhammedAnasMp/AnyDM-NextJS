"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import api from "@/lib/services/api.service";
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  CheckCircle2,
  Clock,
  MessageSquare,
  DollarSign,
  UserPlus,
  Activity,
  AlertCircle,
  Send,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

/* ──────────────────────────── Types ──────────────────────────── */

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
  open_rate: number;
  engagement_score: number;
  response_speed: string;
  total_interactions: number;
  total_customers: number;
  total_orders: number;
  funnel_steps: FunnelStep[];
  recent_activities: ActivityItem[];
  kpi_summary: {
    active_automations: number;
    total_dms_sent: number;
    revenue_30d: number;
    new_leads: number;
  };
}

/* ─────────────── Compact Progress Bar Component ─────────────── */

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1 w-full bg-white/5 rounded overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export default function DashboardOverview() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts || []);
  const activeAccount =
    instagramAccounts.find((acc: any) => acc.id === appUser?.active_instagram_account_id) ||
    instagramAccounts[0];

  const activeAccountId = activeAccount?.id;

  const [rateLimits, setRateLimits] = useState<RateLimitData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [rateRes, analyticsRes] = await Promise.allSettled([
        api.get("/accounts/instagram/rate-limits/", {
          params: activeAccountId ? { account_id: activeAccountId } : {}
        }),
        api.get("/crm/analytics/", {
          params: { timeframe: "30d", ...(activeAccountId ? { account_id: activeAccountId } : {}) }
        })
      ]);
      if (rateRes.status === "fulfilled" && rateRes.value.data) setRateLimits(rateRes.value.data);
      if (analyticsRes.status === "fulfilled" && analyticsRes.value.data) setAnalytics(analyticsRes.value.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 25000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  useEffect(() => {
    const handleRefresh = () => fetchAll();
    window.addEventListener("refresh-dashboard-overview", handleRefresh);
    window.addEventListener("refresh-active-page", handleRefresh);
    return () => {
      window.removeEventListener("refresh-dashboard-overview", handleRefresh);
      window.removeEventListener("refresh-active-page", handleRefresh);
    };
  }, [fetchAll]);

  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPage = 4;

  /* ── Derived values ── */
  const kpi = analytics?.kpi_summary;
  const activities = analytics?.recent_activities || [];
  const funnelSteps = analytics?.funnel_steps || [];

  const totalActivityPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const paginatedActivities = activities.slice((activityPage - 1) * itemsPerPage, activityPage * itemsPerPage);

  const publishCount = rateLimits?.daily_publish_count ?? 0;
  const publishLimit = rateLimits?.daily_publish_limit || 100;

  const hourlyPct = rateLimits ? Math.min(100, Math.round((rateLimits.hourly_dm_count / rateLimits.hourly_dm_limit) * 100)) : 0;
  const hourlyColor = hourlyPct > 80 ? "#ef4444" : hourlyPct > 60 ? "#f59e0b" : "#c4c0ff";

  const apiPct = rateLimits?.rate_limit_utilization_pct ?? 0;
  const apiColor = apiPct > 80 ? "#ef4444" : "#8fe3ff";

  const publishPct = publishLimit > 0 ? Math.min(100, Math.round((publishCount / publishLimit) * 100)) : 0;

  const healthBadge = (status: string) => {
    if (status === "WARNING" || status === "THROTTLED") return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    if (status === "MODERATE") return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30";
  };

  /* ═══════════════════════════ Render ═══════════════════════════ */

  return (
    <div className="relative space-y-4 overflow-hidden text-[#e5e2e1] pb-16 w-full font-sans">
      {/* Top Ambient Glow */}
      {/* <div abount="pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[550px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/12 to-[#c4c0ff]/0 blur-3xl" /> */}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-3 rounded border border-[#2a2a2a] shadow-sm relative overflow-hidden">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e5e2e1]">Overview</h1>

          </div>
          <p className="text-xs text-[#8e9192]">Live account safety status, message limits, and customer interaction activity.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAll}
            className="hidden sm:flex p-2 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white hover:border-[#444748] transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>

        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Automations", val: loading ? "..." : String(kpi?.active_automations ?? 0), sub: "Running reply rules", icon: Zap, iconColor: "text-[#c4c0ff]" },
          { label: "Messages Sent (30d)", val: loading ? "..." : (kpi?.total_dms_sent ?? 0).toLocaleString(), sub: "Outbound Instagram DMs", icon: Send, iconColor: "text-[#c4c0ff]" },
          { label: "Total Revenue (30d)", val: loading ? "..." : `₹${(kpi?.revenue_30d ?? 0).toLocaleString()}`, sub: "Completed customer checkouts", icon: DollarSign, iconColor: "text-[#c4c0ff]" },
          { label: "New Customers Reached", val: loading ? "..." : (kpi?.new_leads ?? 0).toLocaleString(), sub: "Unique leads in conversation", icon: UserPlus, iconColor: "text-[#c4c0ff]" }
        ].map((k, i) => (
          <div key={i} className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192]">{k.label}</span>
              <k.icon className={`w-3.5 h-3.5 ${k.iconColor}`} />
            </div>
            <p className="text-xl font-semibold text-[#e5e2e1] tracking-tight">{k.val}</p>
            <p className="text-[11px] text-[#8e9192]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Rate Limit Health Panel ── */}
      <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-3">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              {/* <h2 className="text-xs font-semibold text-[#e5e2e1]">Instagram Account Safety &amp; Health</h2> */}
              <p className="text-[11px] text-[#8e9192]">Monitors official Instagram API speed limits to protect your account from bans</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rateLimits && (
              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${healthBadge(rateLimits.health_status)}`}>
                {rateLimits.health_status === "SAFE" ? "Account Safe" : rateLimits.health_status}
              </span>
            )}
            {/* <span className="px-2 py-0.5 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 text-[#c4c0ff] text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff] animate-pulse" />
              Anti-Block Shield On
            </span> */}
          </div>
        </div>

        {/* 4 sub-metric tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Hourly DM */}
          <div className="p-3 rounded bg-[#101115] border border-[#2a2a2a] space-y-1.5">

            <p className="text-lg font-semibold text-[#e5e2e1]">
              {rateLimits?.hourly_dm_count ?? 0}<span className="text-xs text-[#8e9192] font-normal"> / {rateLimits?.hourly_dm_limit ?? 200} DMs</span>
            </p>
            <MiniBar value={rateLimits?.hourly_dm_count ?? 0} max={rateLimits?.hourly_dm_limit ?? 200} color={hourlyColor} />
            <p className="text-[10px] text-[#8e9192]">{rateLimits?.hourly_dm_remaining ?? 200} messages available this hour</p>
          </div>

          {/* Meta API */}
          <div className="p-3 rounded bg-[#101115] border border-[#2a2a2a] space-y-1.5">

            <p className="text-lg font-semibold text-[#e5e2e1]">
              {apiPct}%<span className="text-xs text-[#8e9192] font-normal"> capacity</span>
            </p>
            <MiniBar value={apiPct} max={100} color={apiColor} />
            <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Resets in {Math.ceil((rateLimits?.reset_time_seconds || 3600) / 60)} minutes
            </p>
          </div>

          {/* 24h Window */}
          <div className="p-3 rounded bg-[#101115] border border-[#2a2a2a] space-y-1.5">

            <p className="text-lg font-semibold text-[#e5e2e1]">
              {publishCount}<span className="text-xs text-[#8e9192] font-normal"> / {publishLimit} posts</span>
            </p>
            <MiniBar value={publishCount} max={publishLimit} color="#c4c0ff" />
            <p className="text-[10px] text-[#8e9192]">{Math.max(0, publishLimit - publishCount)} post slots available today</p>
          </div>


          {/* Publish Quota */}
        </div>


      </div>

      {/* ── Main Content: Activity Feed + Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed (2/3) */}
        <div className="lg:col-span-2 p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2a2a2a]">
            <h3 className="text-xs font-semibold text-[#e5e2e1] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#c4c0ff]" /> Activity Feed
            </h3>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-xs text-[#8e9192]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c4c0ff] mb-2" />
                Loading activity stream...
              </div>
            ) : paginatedActivities.length > 0 ? (
              paginatedActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded bg-[#101115] border border-[#2a2a2a] hover:border-[#444748] transition-colors">
                  <div className={`w-7 h-7 rounded bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center shrink-0 ${act.isHighlight ? "text-[#c4c0ff]" : "text-[#8e9192]"}`}>
                    {act.icon === "auto_awesome" ? <Zap className="w-3.5 h-3.5" /> :
                      act.icon === "forum" ? <MessageSquare className="w-3.5 h-3.5" /> :
                        <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#e5e2e1] truncate">{act.agent}</p>
                      <span className="text-[10px] text-[#8e9192] shrink-0">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-[#c4c7c8] mt-0.5 line-clamp-2 leading-relaxed">{act.desc}</p>
                    {act.tags && act.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {act.tags.map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-[#20201f] border border-[#2a2a2a] text-[9px] text-[#c4c0ff] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <MessageSquare className="w-6 h-6 mx-auto text-[#c4c0ff] opacity-50" />
                <p className="text-xs font-semibold text-[#e5e2e1]">No recent activity</p>
                <p className="text-[11px] text-[#8e9192]">Automated DMs, replies, and interactions will stream here.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {activities.length > 0 && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#2a2a2a] text-xs">
              <span className="text-[11px] text-[#8e9192]">
                Page {activityPage} of {totalActivityPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                  disabled={activityPage === 1}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                  disabled={activityPage >= totalActivityPages}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Funnel + Engagement */}
        <div className="space-y-4">
          {/* Conversion Funnel */}
          <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Conversion Funnel</h3>
            <div className="space-y-2.5">
              {(funnelSteps.length > 0 ? funnelSteps : [
                { label: "Impression", value: "0", percent: "100%", dropoff: "0%" },
                { label: "Engagement", value: "0", percent: "0%", dropoff: "0%" },
                { label: "DM Started", value: "0", percent: "0%", dropoff: "0%" },
                { label: "Conversion", value: "0", percent: "0%", dropoff: "Final CR" }
              ]).map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#8e9192]">
                    <span className="font-semibold">{step.label}</span>
                    <span className="text-[#e5e2e1] font-semibold">{step.value}</span>
                  </div>
                  <div className="h-6 bg-[#101115] rounded border border-[#2a2a2a] relative overflow-hidden flex items-center justify-between px-2.5 text-[10px] font-semibold">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#c4c0ff]/12 transition-all duration-500"
                      style={{ width: step.percent.endsWith("%") ? step.percent : "100%" }}
                    />
                    <span className="relative z-10 text-[#e5e2e1]">{step.percent}</span>
                    <span className="relative z-10 text-[#8e9192]">{step.dropoff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick engagement metrics */}
          <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-2.5">
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Engagement Summary</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-center space-y-0.5">
                <p className="text-lg font-semibold text-[#e5e2e1]">{analytics?.engagement_score ?? 0}</p>
                <p className="text-[10px] text-[#8e9192]">Engagement Score</p>
              </div>
              <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-center space-y-0.5">
                <p className="text-lg font-semibold text-[#e5e2e1]">{analytics?.response_speed ?? "0m"}</p>
                <p className="text-[10px] text-[#8e9192]">Avg Response</p>
              </div>
              <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-center space-y-0.5">
                <p className="text-lg font-semibold text-[#e5e2e1]">{analytics?.open_rate ?? 0}%</p>
                <p className="text-[10px] text-[#8e9192]">DM Open Rate</p>
              </div>
              <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-center space-y-0.5">
                <p className="text-lg font-semibold text-[#e5e2e1]">{analytics?.total_orders ?? 0}</p>
                <p className="text-[10px] text-[#8e9192]">Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
