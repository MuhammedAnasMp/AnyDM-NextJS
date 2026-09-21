"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/lib/services/api.service";
import {
  RefreshCw,
  TrendingUp,
  BarChart2,
  Zap,
  Activity,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

/* ──────────────────────────── Types ──────────────────────────── */

interface FunnelStep {
  label: string;
  value: string;
  percent: string;
  dropoff: string;
}

interface AutomationItem {
  name: string;
  status: string;
  stat: string;
  ok: boolean;
}

interface TopProductItem {
  name: string;
  sales: string;
  growth: string;
}

interface ChartBarItem {
  height: string;
  showLabel?: boolean;
  val?: number;
}

interface AnalyticsData {
  timeframe: string;
  open_rate: number;
  open_rate_change: string;
  engagement_score: number;
  response_speed: string;
  sentiment: string;
  chart_bars: ChartBarItem[];
  funnel_steps: FunnelStep[];
  automation_health: AutomationItem[];
  top_products: TopProductItem[];
  total_interactions: number;
  total_customers: number;
  total_orders: number;
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export default function AnalyticsPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts || []);
  const activeAccount =
    instagramAccounts.find((acc: any) => acc.id === appUser?.active_instagram_account_id) ||
    instagramAccounts[0];
  const activeAccountId = activeAccount?.id;

  const [timeframe, setTimeframe] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (tf: string, manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    try {
      const params: any = { timeframe: tf };
      if (activeAccountId) params.account_id = activeAccountId;
      const res = await api.get("/crm/analytics/", { params });
      if (res.data) setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe, fetchAnalytics]);

  useEffect(() => {
    const handleRefresh = () => fetchAnalytics(timeframe, true);
    window.addEventListener("refresh-dashboard-analytics", handleRefresh);
    window.addEventListener("refresh-active-page", handleRefresh);
    return () => {
      window.removeEventListener("refresh-dashboard-analytics", handleRefresh);
      window.removeEventListener("refresh-active-page", handleRefresh);
    };
  }, [timeframe, fetchAnalytics]);

  /* ── Derived funnel ── */
  const funnelSteps = useMemo(() => {
    if (data?.funnel_steps && data.funnel_steps.length > 0) return data.funnel_steps;
    const ti = data?.total_interactions || 0;
    const tc = data?.total_customers || 0;
    const td = ti > 0 ? Math.max(1, Math.round(ti * 0.42)) : 0;
    const to = data?.total_orders || 0;
    const d1 = ti > 0 ? ((1 - tc / ti) * 100).toFixed(1) : "0.0";
    const d2 = tc > 0 ? ((1 - td / tc) * 100).toFixed(1) : "0.0";
    const cr = td > 0 ? ((to / td) * 100).toFixed(1) : "0.0";
    return [
      { label: "Impression / Reach", value: ti.toLocaleString(), percent: "100%", dropoff: `${d1}% drop-off` },
      { label: "Audience Engagement", value: tc.toLocaleString(), percent: ti > 0 ? `${((tc / ti) * 100).toFixed(1)}%` : "0%", dropoff: `${d2}% drop-off` },
      { label: "Inbound DMs Started", value: td.toLocaleString(), percent: tc > 0 ? `${((td / tc) * 100).toFixed(1)}%` : "0%", dropoff: `${(100 - parseFloat(cr)).toFixed(1)}% drop-off` },
      { label: "Completed Orders", value: to.toLocaleString(), percent: `${cr}%`, dropoff: "Final CR" }
    ];
  }, [data]);

  const [autHealthPage, setAutHealthPage] = useState(1);
  const [topProductsPage, setTopProductsPage] = useState(1);
  const itemsPerPage = 4;

  const chartBars = data?.chart_bars || [];
  const autHealth = data?.automation_health || [];
  const topProducts = data?.top_products || [];

  const totalAutHealthPages = Math.max(1, Math.ceil(autHealth.length / itemsPerPage));
  const paginatedAutHealth = autHealth.slice((autHealthPage - 1) * itemsPerPage, autHealthPage * itemsPerPage);

  const totalTopProductsPages = Math.max(1, Math.ceil(topProducts.length / itemsPerPage));
  const paginatedTopProducts = topProducts.slice((topProductsPage - 1) * itemsPerPage, topProductsPage * itemsPerPage);

  const maxBarVal = chartBars.length > 0 ? Math.max(...chartBars.map(b => b.val || 0), 1) : 1;

  return (
    <div className="relative space-y-4 overflow-hidden text-[#e5e2e1] pb-16 w-full font-sans">
      {/* Top Ambient Glow */}
      {/* <div abount="pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[550px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/12 to-[#c4c0ff]/0 blur-3xl" /> */}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-3 rounded border border-[#2a2a2a] shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e5e2e1]">Analytics</h1>
            {/* <span className="px-2 py-0.5 rounded bg-[#20201f] border border-[#2a2a2a] text-[#c4c0ff] text-[11px] font-semibold"> */}
            {timeframe.toUpperCase()}
            {/* </span> */}
          </div>

        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Timeframe Selector */}
          <div className="bg-[#101115] border border-[#2a2a2a] rounded p-0.5 flex gap-0.5 text-[11px]">
            {["7d", "30d", "90d", "1y", "all"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer",
                  timeframe === tf ? "bg-[#20201f] text-white border border-[#2a2a2a]" : "text-[#8e9192] hover:text-white"
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAnalytics(timeframe, true)}
            disabled={refreshing}
            className="hidden sm:flex p-2 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 3 Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Interactions", val: loading ? "..." : (data?.total_interactions ?? 0).toLocaleString(), icon: MessageSquare, sub: `Message open rate: ${data?.open_rate ?? 0}%`, iconColor: "text-[#c4c0ff]" },
          { label: "Active Customers", val: loading ? "..." : (data?.total_customers ?? 0).toLocaleString(), icon: Activity, sub: `Engagement score: ${data?.engagement_score ?? 0}`, iconColor: "text-[#c4c0ff]" },
          { label: "Orders Generated", val: loading ? "..." : (data?.total_orders ?? 0).toLocaleString(), icon: ShoppingBag, sub: `Average reply speed: ${data?.response_speed ?? "0m"}`, iconColor: "text-[#c4c0ff]" }
        ].map((k, i) => (
          <div key={i} className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e9192]">{k.label}</span>
              <k.icon className={`w-3.5 h-3.5 ${k.iconColor}`} />
            </div>
            <p className="text-xl font-semibold text-[#e5e2e1]">{k.val}</p>
            <p className="text-[11px] text-[#8e9192]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 2-Column: Funnel + Traffic Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Conversion Funnel</h3>
            <span className="text-[10px] text-[#c4c0ff] font-semibold">{timeframe.toUpperCase()}</span>
          </div>
          <div className="space-y-2.5">
            {funnelSteps.map((step, idx) => (
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

        {/* Traffic Bar Chart */}
        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <div>
              <h3 className="text-xs font-semibold text-[#e5e2e1]">Interaction Speed &amp; Activity</h3>
              <p className="text-[11px] text-[#8e9192]">3-hour volume distribution</p>
            </div>
          </div>
          <div className="h-40 w-full flex items-end gap-1.5 pt-4">
            {(chartBars.length > 0 ? chartBars : Array(9).fill(null).map(() => ({ val: 0 }))).map((bar: any, i: number) => {
              const barVal = bar.val || 0;
              const h = maxBarVal > 0 ? Math.max(5, Math.round((barVal / maxBarVal) * 100)) : 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  {bar.showLabel && barVal > 0 && (
                    <span className="text-[9px] font-semibold text-[#c4c0ff]">{barVal}</span>
                  )}
                  <div
                    className="w-full bg-[#20201f] group-hover:bg-[#c4c0ff]/50 border border-[#2a2a2a] rounded-t transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-[#8e9192] pt-2 border-t border-[#2a2a2a] mt-2">
            {Array.from({ length: 9 }, (_, i) => <span key={i}>{`${(9 - i) * 3}h ago`}</span>).reverse()}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Automation Health + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Automation Rule Health */}
        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Automation Rule Status</h3>
            <div className="space-y-2">
              {autHealth.length > 0 ? (
                paginatedAutHealth.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] flex items-center justify-between text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-[#e5e2e1] truncate">{rule.name}</p>
                      <p className="text-[10px] text-[#8e9192]">{rule.stat}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded .border text-[10px] font-semibold shrink-0",
                      rule.ok ? ".bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30" : "bg-[#20201f] text-[#8e9192] border-[#2a2a2a]"
                    )}>
                      {rule.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-xs text-[#8e9192]">
                  No automation rules configured
                </div>
              )}
            </div>
          </div>
          {autHealth.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] text-xs">
              <span className="text-[11px] text-[#8e9192]">
                Page {autHealthPage} of {totalAutHealthPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAutHealthPage((p) => Math.max(1, p - 1))}
                  disabled={autHealthPage === 1}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setAutHealthPage((p) => Math.min(totalAutHealthPages, p + 1))}
                  disabled={autHealthPage >= totalAutHealthPages}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top Product Conversions */}
        <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Top Product DM Conversions</h3>
            <div className="space-y-2">
              {topProducts.length > 0 ? (
                paginatedTopProducts.map((prod, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] flex items-center justify-between text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-[#e5e2e1] truncate">{prod.name}</p>
                      <p className="text-[10px] text-[#8e9192]">{prod.sales}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded .bg-[#20201f] .border border-[#2a2a2a] text-[#c4c0ff] text-[10px] font-semibold shrink-0">
                      {prod.growth}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded bg-[#101115] border border-[#2a2a2a] text-xs text-[#8e9192]">
                  No product sales recorded
                </div>
              )}
            </div>
          </div>
          {topProducts.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] text-xs">
              <span className="text-[11px] text-[#8e9192]">
                Page {topProductsPage} of {totalTopProductsPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTopProductsPage((p) => Math.max(1, p - 1))}
                  disabled={topProductsPage === 1}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTopProductsPage((p) => Math.min(totalTopProductsPages, p + 1))}
                  disabled={topProductsPage >= totalTopProductsPages}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
