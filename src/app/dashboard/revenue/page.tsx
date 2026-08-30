"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/services/api.service";
import { DollarSign, TrendingUp, RefreshCw, ShoppingBag, CreditCard, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

interface RecentOrder {
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
  settlements: {
    pending: number;
    paid: number;
  };
  recent_orders: RecentOrder[];
}

export default function RevenuePage() {
  const [timeframe, setTimeframe] = useState<string>("30d");
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRevenueData = async (tf: string, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/crm/revenue/", {
        params: { timeframe: tf }
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(timeframe);
  }, [timeframe]);

  const chartPoints = data?.chart_points || [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
      case "CONFIRMED":
      case "PAYMENT_RECEIVED":
      case "PAID":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PENDING":
      case "PENDING_PAYMENT":
      case "PROCESSING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "CANCELLED":
      case "REFUNDED":
      case "PAYMENT_FAILED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-white/5 text-on-surface-variant border-white/10";
    }
  };

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
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Revenue Growth
          </h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">
            Track gross merchandise sales volumes, order economics, and payout settlements connected across linked checkout workflows.
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
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeframe === tf.id
                    ? "bg-white text-black shadow-md"
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchRevenueData(timeframe, true)}
            disabled={refreshing}
            className="glass-pane px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold hover:bg-white/10 transition-colors"
            title="Refresh revenue data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : "text-white"}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="glass-pane px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>Syncing Live Billing</span>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="glass-pane p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Monthly Runrate (MRR)</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {loading ? "..." : `₹${(data?.mrr || 0).toLocaleString()}`}
          </h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {data?.mrr_growth || "0 orders"}
          </p>
        </div>

        <div className="glass-pane p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Annualized Rate (ARR)</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {loading ? "..." : `₹${(data?.arr || 0).toLocaleString()}`}
          </h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Projection based on current runrate</p>
        </div>

        <div className="glass-pane p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Avg Order Value (AOV)</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {loading ? "..." : `₹${(data?.aov || 0).toLocaleString()}`}
          </h3>
          <p className="text-xs text-on-surface-variant/60 mt-2">
            Calculated across {data?.total_sales_count || 0} sales
          </p>
        </div>

        <div className="glass-pane p-6 rounded-2xl">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Sales Volume</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {loading ? "..." : `₹${(data?.total_revenue || 0).toLocaleString()}`}
          </h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Gross checkout volume
          </p>
        </div>
      </div>

      {/* Revenue growth graph card */}
      <div className="glass-pane p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Sales Trajectory & Cash Velocity</h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">Calculated in INR (₹)</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-white">
              {timeframe.toUpperCase()} Window
            </span>
          </div>
        </div>

        {/* Custom SVG line chart */}
        <div className="h-64 w-full mt-6 relative">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(52,211,153,0.25)" />
                <stop offset="100%" stopColor="rgba(52,211,153,0)" />
              </linearGradient>
            </defs>
            {/* Area Path */}
            <path
              d={`M 0 200 ${chartPoints.map((pt, idx) => `L ${(idx * 600) / (chartPoints.length - 1)} ${200 - pt}`).join(" ")} L 600 200 Z`}
              fill="url(#chartGradient)"
            />
            {/* Line Path */}
            <path
              d={chartPoints.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${(idx * 600) / (chartPoints.length - 1)} ${200 - pt}`).join(" ")}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              className="chart-glow"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] text-on-surface-variant/60 pt-2 border-t border-white/5 font-medium">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Settlements & Recent Orders */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payout & Settlements summary */}
        <div className="col-span-12 lg:col-span-4 glass-pane p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Payout Settlements
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                AUTO-SETTLE
              </span>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Pending Seller Payouts</span>
                  <span className="text-amber-400 font-bold text-sm">
                    ₹{(data?.settlements?.pending || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 mt-1">Scheduled for next batch disbursement</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Completed Payouts</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ₹{(data?.settlements?.paid || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 mt-1">Transferred directly to bank account</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-6 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant/70">Gateway Processing</span>
            <span className="text-white font-semibold">Razorpay & COD Active</span>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="col-span-12 lg:col-span-8 glass-pane p-6 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" /> Recent Orders & Checkout Transactions
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-on-surface-variant/60">Loading recent orders...</div>
            ) : data?.recent_orders && data.recent_orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-white">
                    {data.recent_orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-semibold font-mono text-primary">{ord.order_id}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-white">{ord.customer_name}</p>
                          <p className="text-[10px] text-on-surface-variant/60">{ord.customer_email}</p>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">₹{ord.total_amount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-on-surface-variant font-medium">{ord.payment_method}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(ord.order_status)}`}>
                            {ord.order_status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-on-surface-variant/70 text-[11px] whitespace-nowrap">
                          {ord.created_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center glass-pane rounded-xl my-4">
                <p className="text-sm font-semibold text-white">No transactions recorded yet</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Orders created via direct message checkouts will appear here in real time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

