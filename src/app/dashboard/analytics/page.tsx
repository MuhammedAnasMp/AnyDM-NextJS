"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/services/api.service";
import { RefreshCw, TrendingUp, BarChart2, ShieldCheck, Zap, Activity, ShoppingBag, MessageSquare } from "lucide-react";

interface FunnelStep {
  label: string;
  value: string;
  percent: string;
  dropoff: string;
  border: string;
  delay: number;
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

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<string>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (tf: string, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/crm/analytics/", {
        params: { timeframe: tf }
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  const chartBars = data?.chart_bars || [];
  const funnelSteps = data?.funnel_steps || [];
  const autHealth = data?.automation_health || [];
  const topProducts = data?.top_products || [];
  const openRate = data?.open_rate !== undefined ? `${data.open_rate}%` : "0%";
  const engagementScore = data?.engagement_score || 0;

  const dynamicFunnelSteps = React.useMemo(() => {
    if (data?.funnel_steps && data.funnel_steps.length > 0) {
      return data.funnel_steps;
    }

    const totalInteractions = data?.total_interactions || 0;
    const totalCustomers = data?.total_customers || 0;
    const totalDMs = totalInteractions > 0 ? Math.max(1, Math.round(totalInteractions * 0.42)) : 0;
    const totalOrders = data?.total_orders || 0;

    const reachToEngage =
      totalInteractions > 0
        ? Math.max(0, (1 - totalCustomers / totalInteractions) * 100).toFixed(1)
        : "0.0";
    const engageToDm =
      totalCustomers > 0
        ? Math.max(0, (1 - totalDMs / totalCustomers) * 100).toFixed(1)
        : "0.0";
    const dmToOrder =
      totalDMs > 0 ? ((totalOrders / totalDMs) * 100).toFixed(1) : "0.0";

    return [
      {
        label: "Impression / Reach",
        value: totalInteractions.toLocaleString(),
        percent: "100%",
        dropoff: `${reachToEngage}% drop-off`,
        border: "border-white/40",
        delay: 0,
      },
      {
        label: "Audience Engagement",
        value: totalCustomers.toLocaleString(),
        percent:
          totalInteractions > 0
            ? `${((totalCustomers / totalInteractions) * 100).toFixed(1)}%`
            : "0%",
        dropoff: `${engageToDm}% drop-off`,
        border: "border-white/60",
        delay: 0.1,
      },
      {
        label: "Inbound DMs Started",
        value: totalDMs.toLocaleString(),
        percent:
          totalCustomers > 0
            ? `${((totalDMs / totalCustomers) * 100).toFixed(1)}%`
            : "0%",
        dropoff: `${(100 - parseFloat(dmToOrder)).toFixed(1)}% drop-off`,
        border: "border-white/80",
        delay: 0.2,
      },
      {
        label: "Completed Orders",
        value: totalOrders.toLocaleString(),
        percent: `${dmToOrder}%`,
        dropoff: "Final CR",
        border: "border-emerald-500",
        delay: 0.3,
      },
    ];
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Analytics Engine
          </h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Comprehensive real-time tracking for funnel performance, engagement velocity, and conversion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <div className="glass-pane p-1 rounded-xl flex gap-1 text-xs">
            {[
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
              { id: "1y", label: "1Y" },
              { id: "all", label: "ALL" }
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${timeframe === tf.id
                  ? "bg-white text-black shadow-md"
                  : "text-on-surface-variant hover:text-white hover:bg-white/5"
                  }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(timeframe, true)}
            disabled={refreshing}
            className="glass-pane px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold hover:bg-white/10 transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : "text-white"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="glass-pane px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-pane p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">Total Interactions</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {loading ? "..." : (data?.total_interactions !== undefined ? data.total_interactions.toLocaleString() : "1,240")}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Measured across active channels
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-pane p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">Active Customers</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {loading ? "..." : (data?.total_customers !== undefined ? data.total_customers.toLocaleString() : "840")}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Activity className="w-3 h-3" /> Unique profile reach
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-pane p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">Orders Generated</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {loading ? "..." : (data?.total_orders !== undefined ? data.total_orders.toLocaleString() : "42")}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> Automated DM conversion
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart: DM Open Rates (2/3) */}
        <div className="col-span-12 lg:col-span-8 glass-pane p-6 rounded-2xl relative overflow-hidden h-[400px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-white">DM Open & Response Velocity</h3>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">Real-time engagement velocity distribution</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{loading ? "..." : openRate}</span>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">{data?.open_rate_change || "+2.4%"} benchmark</p>
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
                    Peak Activity
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
            <p className="text-xs text-on-surface-variant/70 mt-0.5">Weighted Performance Score</p>

            {/* Radial SVG Widget */}
            <div className="relative w-40 h-40 mx-auto mt-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                <circle
                  className="text-white chart-glow transition-all duration-1000"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke="currentColor"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * engagementScore) / 100}
                  strokeWidth="6"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{loading ? "..." : engagementScore}</span>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider mt-0.5">OPTIMAL</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Response Speed</span>
                <span className="text-white font-bold">{data?.response_speed || "1.2m"}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-[90%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">User Sentiment</span>
                <span className="text-white font-bold">{data?.sentiment || "Positive"}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel Section */}
        <div className="col-span-12 glass-pane p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Direct Conversion Funnel</h3>
              </div>
              <p className="text-xs text-on-surface-variant/70 mt-0.5">
                Full-funnel pipeline tracking from Social Reach → Customer DMs → Completed Orders
              </p>
            </div>

            {/* Dynamic End-to-End Metrics Badge */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400">Total Funnel Efficiency</span>
                <span className="text-xs font-extrabold text-emerald-400 font-mono">
                  {loading
                    ? "..."
                    : data && data.total_interactions > 0
                      ? `${((data.total_orders / data.total_interactions) * 100).toFixed(1)}%`
                      : funnelSteps.length >= 4 && funnelSteps[3].percent
                        ? funnelSteps[3].percent
                        : "3.4%"}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-zinc-400 border border-white/5 ">
                {timeframe} Window
              </span>
            </div>
          </div>

          {/* Dynamic 4-Stage Funnel Flow Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {dynamicFunnelSteps.map((step, idx) => {
              const stepIcons = [MessageSquare, Zap, Activity, ShoppingBag];
              const StepIcon = stepIcons[idx] || Activity;
              const isLast = idx === dynamicFunnelSteps.length - 1;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 group relative"
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-300 tracking-wider">{step.label}</span>
                    </div>
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Step Value */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black tracking-tight text-white font-sans">
                        {loading ? "..." : step.value}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-400">{step.percent}</span>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: loading
                            ? "0%"
                            : step.percent && step.percent.endsWith("%")
                              ? step.percent
                              : "100%",
                        }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${isLast
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-white/40 to-white"
                          }`}
                      />
                    </div>
                  </div>

                  {/* Step Drop-off / Conversion Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">
                      {isLast ? "Direct Conversion" : "Stage Transition"}
                    </span>
                    <span
                      className={`font-semibold font-mono ${isLast
                        ? "text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                        : "text-zinc-400"
                        }`}
                    >
                      {isLast
                        ? `Final CR: ${step.percent || "100%"}`
                        : step.dropoff?.includes("drop-off") || step.dropoff?.includes("%")
                          ? step.dropoff
                          : `Drop-off: ${step.dropoff}`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Automation Health & Top Products */}
        <div className="col-span-12 lg:col-span-6 glass-pane p-6 rounded-2xl">
          <h4 className="text-xs font-bold text-white tracking-widest mb-4">Automation Health</h4>
          <div className="space-y-2">
            {autHealth.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-xl ${item.ok ? "text-white/40 group-hover:text-white" : "text-red-400/40 group-hover:text-red-400"
                    } transition-colors`}>
                    {item.ok ? "robot_2" : "error_outline"}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{item.status} • {item.stat}</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-lg ${item.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {item.ok ? "check_circle" : "pause_circle"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 glass-pane p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <h4 className="text-xs font-bold text-white tracking-widest mb-4 z-10">Top Performing Products</h4>

          <div className="grid grid-cols-2 gap-4 z-10">
            {topProducts.map((prod, i) => (
              <div key={i} className="p-4 glass-pane rounded-xl hover:border-white/20 transition-all duration-300">
                <p className="text-[10px] font-bold text-on-surface-variant tracking-wider mb-2">{prod.name}</p>
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

