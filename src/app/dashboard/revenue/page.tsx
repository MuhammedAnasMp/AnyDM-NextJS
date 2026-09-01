"use client";

import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/services/api.service";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  BarChart2,
  CreditCard,
  Package,
  ArrowUpRight,
  Clock,
  Wallet,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────── Types ──────────────────────────── */

interface OrderItem {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

interface RevenueData {
  timeframe: string;
  mrr: number;
  mrr_growth: string;
  arr: number;
  aov: number;
  total_sales_count: number;
  total_revenue: number;
  chart_points: number[];
  status_summary: Record<string, { count: number; total: number }>;
  settlements: { pending: number; paid: number };
  recent_orders: OrderItem[];
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export default function RevenuePage() {
  const [timeframe, setTimeframe] = useState("30d");
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenue = async (tf: string, manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get("/crm/revenue/", { params: { timeframe: tf } });
      if (res.data) setData(res.data);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue(timeframe);
  }, [timeframe]);

  const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  /* ── SVG Revenue Chart ── */
  const chartPoints = data?.chart_points || [];
  const svgPath = useMemo(() => {
    if (chartPoints.length < 2) return "";
    const maxVal = Math.max(...chartPoints, 1);
    const w = 100;
    const h = 100;
    const pts = chartPoints.map((v, i) => ({
      x: (i / (chartPoints.length - 1)) * w,
      y: h - (v / maxVal) * h * 0.85 - 5
    }));
    const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
    const fill = `${line} L${w},${h} L0,${h} Z`;
    return JSON.stringify({ line, fill });
  }, [chartPoints]);

  const parsedChart = svgPath ? JSON.parse(svgPath) : null;
  const statusStyle = (s: string) => {
    const m: Record<string, string> = {
      DELIVERED: "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30",
      COMPLETED: "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30",
      PAYMENT_RECEIVED: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      CONFIRMED: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      PACKED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      SHIPPED: "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30",
      OUT_FOR_DELIVERY: "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30",
      CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      REFUNDED: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      PENDING_PAYMENT: "bg-[#20201f] text-[#8e9192] border-[#2a2a2a]"
    };
    return m[s] || "bg-[#20201f] text-[#8e9192] border-[#2a2a2a]";
  };

  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 5;

  const recentOrders = data?.recent_orders || [];
  const totalOrdersPages = Math.max(1, Math.ceil(recentOrders.length / itemsPerPage));
  const paginatedOrders = recentOrders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);

  return (
    <div className="relative space-y-4 overflow-hidden text-[#e5e2e1] pb-16 w-full font-sans">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[550px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/12 to-[#c4c0ff]/0 blur-3xl" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-4 rounded border border-[#2a2a2a] shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e5e2e1]">Revenue Growth</h1>

          </div>
          <p className="text-xs text-[#8e9192]">Track monthly recurring revenue, payout settlements, and transaction history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            onClick={() => fetchRevenue(timeframe, true)}
            disabled={refreshing}
            className="p-2 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white transition-colors cursor-pointer"
            title="Refresh revenue metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 4 Revenue KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Monthly Recurring (MRR)", val: loading ? "..." : fmt(data?.mrr ?? 0), sub: data?.mrr_growth || "Monthly revenue", icon: TrendingUp, iconColor: "text-[#c4c0ff]" },
          { label: "Annualized Rate (ARR)", val: loading ? "..." : fmt(data?.arr ?? 0), sub: "Yearly projection", icon: ArrowUpRight, iconColor: "text-[#c4c0ff]" },
          { label: "Average Order Value", val: loading ? "..." : fmt(data?.aov ?? 0), sub: `${data?.total_sales_count ?? 0} total sales completed`, icon: ShoppingCart, iconColor: "text-[#c4c0ff]" },
          { label: "Total Period Sales", val: loading ? "..." : fmt(data?.total_revenue ?? 0), sub: `Gross revenue in ${timeframe.toUpperCase()} range`, icon: DollarSign, iconColor: "text-[#c4c0ff]" }
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

      {/* ── Revenue Trajectory Chart ── */}
      <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
          <div>
            <h3 className="text-xs font-semibold text-[#e5e2e1]">Revenue Growth Trajectory</h3>
            <p className="text-[11px] text-[#8e9192]">Sales volume over {timeframe === "1y" ? "12 months" : "12 time periods"}</p>
          </div>
          <span className="text-[10px] .text-[#c4c0ff] font-semibold">{timeframe.toLocaleUpperCase()}</span>
        </div>
        <div className="h-44 w-full bg-[#101115] rounded border border-[#2a2a2a] p-3">
          {parsedChart ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="revFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c4c0ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#c4c0ff" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={parsedChart.fill} fill="url(#revFill)" />
              <path d={parsedChart.line} fill="none" stroke="#c4c0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#8e9192]">
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-[#c4c0ff]" />
              ) : (
                "No revenue data available for this period."
              )}
            </div>
          )}
        </div>
        <div className="flex justify-between text-[9px] text-[#8e9192] px-1">
          {chartPoints.length > 0 ? Array.from({ length: Math.min(chartPoints.length, 12) }, (_, i) => (
            <span key={i}>Period {i + 1}</span>
          )) : null}
        </div>
      </div>

      {/* ── Bottom: Settlements + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payout Settlements (1/3) */}
        <div className="space-y-3">
          <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e5e2e1] pb-2 border-b border-[#2a2a2a]">
              <Wallet className="w-3.5 h-3.5 text-[#c4c0ff]" />
              Seller Payout Settlements
            </div>
            <div className="p-3 rounded bg-[#101115] border border-[#2a2a2a] space-y-1">
              <p className="text-[11px] text-[#8e9192] font-semibold">Pending Payout Amount</p>
              <p className="text-lg font-semibold text-amber-400">{fmt(data?.settlements?.pending ?? 0)}</p>
              <p className="text-[10px] text-[#8e9192]">Processing in current settlement cycle</p>
            </div>
            <div className="p-3 rounded bg-[#101115] border border-[#2a2a2a] space-y-1">
              <p className="text-[11px] text-[#8e9192] font-semibold">Settled &amp; Deposited</p>
              <p className="text-lg font-semibold text-[#c4c0ff]">{fmt(data?.settlements?.paid ?? 0)}</p>
              <p className="text-[10px] text-[#8e9192]">Transferred to bank account</p>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-2">
            <h3 className="text-xs font-semibold text-[#e5e2e1] pb-2 border-b border-[#2a2a2a]">Status Breakdown</h3>
            <div className="space-y-1.5">
              {data?.status_summary ? Object.entries(data.status_summary).map(([status, info], i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded border ${statusStyle(status)} text-[10px] font-semibold`}>
                    {status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[#8e9192]">{info.count} · {fmt(info.total)}</span>
                </div>
              )) : (
                <p className="text-[11px] text-[#8e9192]">No order data</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders (2/3) */}
        <div className="lg:col-span-2 p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm flex flex-col justify-between space-y-3 overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-[#e5e2e1] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#c4c0ff]" /> Recent Checkout Transactions
              </h3>
              <span className="text-[10px] text-[#8e9192]">{recentOrders.length} total</span>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-[10px] font-semibold text-[#8e9192] uppercase tracking-wider border-b border-[#2a2a2a]">
                    <th className="py-2 pr-3">Order ID</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {recentOrders.length > 0 ? paginatedOrders.map((o) => (
                    <tr key={o.id} className="border-b border-[#2a2a2a]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 pr-3 text-[#c4c0ff] font-semibold">{o.order_id}</td>
                      <td className="py-2.5 pr-3">
                        <p className="text-[#e5e2e1] truncate max-w-[130px]">{o.customer_name || "Guest"}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-[#e5e2e1] font-semibold">{fmt(o.total_amount)}</td>
                      <td className="py-2.5 pr-3 text-[#8e9192]">{o.payment_method}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold ${statusStyle(o.order_status)}`}>
                          {o.order_status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#8e9192] whitespace-nowrap">{o.created_at}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#8e9192]">
                        {loading ? (
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c4c0ff]" />
                        ) : (
                          <div className="space-y-1">
                            <Package className="w-6 h-6 mx-auto text-[#c4c0ff] opacity-50 mb-1" />
                            <p className="text-xs font-semibold text-[#e5e2e1]">No orders yet</p>
                            <p className="text-[11px]">Transactions from your store will appear here.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {recentOrders.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] text-xs">
              <span className="text-[11px] text-[#8e9192]">
                Page {ordersPage} of {totalOrdersPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  disabled={ordersPage === 1}
                  className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOrdersPage((p) => Math.min(totalOrdersPages, p + 1))}
                  disabled={ordersPage >= totalOrdersPages}
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
