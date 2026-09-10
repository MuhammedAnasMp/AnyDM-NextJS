"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Coins,
  Truck,
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ClipboardList,
  Info,
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

function SellerOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;

  const tabQuery = searchParams.get("tab");

  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    today_sales: "0.00",
    pending_orders: 0,
    completed_orders: 0,
    total_earnings: "0.00",
    pending_settlement: "0.00",
    products_sold: 0,
    low_stock_items: 0,
  });
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [settlementFilter, setSettlementFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [payoutHoldMode, setPayoutHoldMode] = useState<"INSTANT" | "MONTHLY">("INSTANT");
  const [instantPayoutCommPct, setInstantPayoutCommPct] = useState<string>("3.00");
  const [isUpdatingPayoutMode, setIsUpdatingPayoutMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"ORDERS" | "SETTLEMENTS">(
    tabQuery === "settlements" ? "SETTLEMENTS" : "ORDERS"
  );
  const [showPayoutInfoModal, setShowPayoutInfoModal] = useState(false);

  useEffect(() => {
    if (tabQuery === "settlements") {
      setActiveTab("SETTLEMENTS");
    } else if (tabQuery === "orders") {
      setActiveTab("ORDERS");
    }
  }, [tabQuery]);

  const handleTabSwitch = (tab: "ORDERS" | "SETTLEMENTS") => {
    setActiveTab(tab);
    const newTab = tab === "SETTLEMENTS" ? "settlements" : "orders";
    router.push(`/dashboard/products/orders?tab=${newTab}`, { scroll: false });
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = activeAccountId ? `/crm/seller/orders/?account_id=${activeAccountId}` : "/crm/seller/orders/";
      const res = await api.get(url);
      if (res.data) {
        setOrders(res.data.orders || []);
        if (res.data.payout_hold_mode) {
          setPayoutHoldMode(res.data.payout_hold_mode);
        }
        if (res.data.instant_payout_commission_pct) {
          setInstantPayoutCommPct(res.data.instant_payout_commission_pct);
        }
        setStats(res.data.stats || {
          today_sales: "0.00",
          pending_orders: 0,
          completed_orders: 0,
          total_earnings: "0.00",
          pending_settlement: "0.00",
          products_sold: 0,
          low_stock_items: 0,
        });
      }
    } catch (err) {
      console.error("Error loading seller orders:", err);
      showToast("Failed to load orders.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutModeToggle = async (newMode: "INSTANT" | "MONTHLY") => {
    setIsUpdatingPayoutMode(true);
    try {
      await api.post("/crm/seller/payout-mode/", {
        payout_hold_mode: newMode,
        account_id: activeAccountId
      });
      setPayoutHoldMode(newMode);
      showToast(
        newMode === "INSTANT"
          ? "Payout mode updated: ⚡ Instant Payouts (T+1 Daily)"
          : "Payout mode updated: 🛡️ Monthly Held Payouts (30-Day Protection)",
        "success"
      );
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update payout hold mode.";
      showToast(msg, "error");
    } finally {
      setIsUpdatingPayoutMode(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [activeAccountId]);


  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch("/crm/seller/orders/", { order_id: orderId, status: newStatus });
      showToast(`Order status updated to ${newStatus.replace("_", " ")}!`, "success");
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update status.";
      showToast(msg, "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to refund this order? This will trigger a customer refund and reverse the transfer from the creator's account.")) {
      return;
    }
    setIsRefunding(true);
    try {
      const res = await api.post("/crm/store/orders/refund/", { order_id: orderId });
      showToast(res.data?.message || "Order refund processed successfully!", "success");
      setSelectedOrder((prev: any) => prev ? { ...prev, order_status: "REFUNDED" } : null);
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to process order refund.";
      showToast(msg, "error");
    } finally {
      setIsRefunding(false);
    }
  };

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_place?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_state?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "All") return true;
    if (selectedFilter === "Pending") {
      return ["PENDING_PAYMENT", "PAYMENT_RECEIVED", "CONFIRMED", "PROCESSING", "PACKED"].includes(o.order_status);
    }
    if (selectedFilter === "Shipped") {
      return ["SHIPPED", "OUT_FOR_DELIVERY"].includes(o.order_status);
    }
    if (selectedFilter === "Delivered") {
      return ["DELIVERED", "COMPLETED"].includes(o.order_status);
    }
    if (selectedFilter === "Cancelled") {
      return ["CANCELLED"].includes(o.order_status);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmountOrdered = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || "0"), 0).toFixed(2);

  const bentoStats = [
    { label: "Total amount ordered", val: `₹${totalAmountOrdered}`, meta: "Gross order value", icon: Coins, color: "[#8e9192]" },
    { label: "Paid by AnyDM", val: `₹${stats.total_earnings}`, meta: "Settled payouts", icon: TrendingUp, color: "[#8e9192]" },
    { label: "Pay by AnyDM (Pending)", val: `₹${stats.pending_settlement}`, meta: "Owed by platform", icon: Coins, color: "[#8e9192]" },
    { label: "Pending orders", val: String(stats.pending_orders), meta: "Awaiting fulfillment", icon: Clock, color: "t[#8e9192]" },
    { label: "Total orders", val: String(orders.length), meta: "Lifetime count", icon: ShoppingBag, color: "[#8e9192]" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 text-[#e5e2e1] pb-16"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20201f] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Orders list</h1>
          <p className="text-xs text-[#c4c7c8] mt-0.5">Manage customer orders, shipping details, tracking numbers, and payouts.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="h-9 px-4 rounded border border-[#2a2a2a] hover:bg-white/[0.02] text-white flex items-center gap-2 text-xs font-medium transition-colors bg-transparent active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {bentoStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-[#c4c7c8]">{stat.label}</p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stat.val}</p>
                <p className="text-[10px] text-[#8e9192] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 inline-block" />
                  {stat.meta}
                </p>
              </div>
              <div className={cn("w-8 h-8 rounded bg-[#131313] border border-[#2a2a2a] flex items-center justify-center", stat.color)}>
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* View Switcher Tabs & Supplier Payout Hold Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pt-2 pb-1">
        {/* Left Side: Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabSwitch("ORDERS")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all rounded-t-lg border-b-2 cursor-pointer",
              activeTab === "ORDERS"
                ? "bg-[#1c1b1b] text-[#b6b2ff] border-[#b6b2ff] shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/5"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
              activeTab === "ORDERS" ? "bg-[#b6b2ff]/20 text-[#b6b2ff]" : "bg-white/5 text-zinc-400"
            )}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("SETTLEMENTS")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all rounded-t-lg border-b-2 cursor-pointer",
              activeTab === "SETTLEMENTS"
                ? "bg-[#1c1b1b] text-[#b6b2ff]"
                : "text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/5"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>AnyDM Settlements</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
              "bg-white/5 text-zinc-400"
            )}>
              {orders.filter(o => o.payment_method === "RAZORPAY").length}
            </span>
          </button>

        </div>

        {/* Right Side: Payout Hold Mode Switcher & Details Info Button */}
        <div className="flex items-center gap-2 shrink-0 pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide hidden lg:inline-block">Payout Mode </span>
          <div className="flex items-center gap-1 bg-[#131313] p-1 rounded-md border border-[#353535]">
            {[
              { id: "INSTANT", label: "⚡ Instant" },
              { id: "MONTHLY", label: "🛡️ Monthly" },
            ].map((mode) => {
              const isSelected = payoutHoldMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handlePayoutModeToggle(mode.id as "INSTANT" | "MONTHLY")}
                  disabled={isUpdatingPayoutMode}
                  className={cn(
                    "py-1 px-2.5 rounded text-[11px] font-semibold transition-all cursor-pointer select-none truncate flex items-center gap-1 disabled:opacity-50",
                    isSelected
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowPayoutInfoModal(true)}
            className="p-1.5 rounded-full hover:bg-[#353535] hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0 text-zinc-400"
            title="Click to view details of Payout Hold Modes"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>


      {activeTab === "ORDERS" ? (
        <div className="space-y-0">
          {/* Control Actions & Filter Bar */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-t p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Segments */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
                {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 h-7 rounded text-xs font-medium transition-colors ${selectedFilter === filter
                      ? "bg-[#20201f] text-white border border-[#2a2a2a] shadow-sm"
                      : "text-[#c4c7c8] hover:text-white border border-transparent"
                      }`}
                  >
                    {filter === "All" ? "All orders" : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] w-4 h-4" strokeWidth={1.75} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#131313] border border-[#2a2a2a] rounded pl-9 pr-4 h-8 text-xs w-full md:w-64 focus:border-[#444748] transition-colors text-white placeholder-[#8e9192] outline-none"
                placeholder="Search by ID, name, phone, city..."
                type="text"
              />
            </div>
          </div>

          {/* Data Table Frame */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] border-t-0 rounded-b overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#2a2a2a] text-[#8e9192] font-medium tracking-wide">
                    <th className="px-6 py-3.5 w-[20%]">Order ID</th>
                    <th className="px-6 py-3.5 w-[22%]">Customer details</th>
                    <th className="px-6 py-3.5 w-[15%]">Payment details</th>
                    <th className="px-6 py-3.5 w-[23%]">Items ordered</th>
                    <th className="px-6 py-3.5 w-[12%]">Status</th>
                    <th className="px-6 py-3.5 text-right w-[8%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-24 rounded" /></td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="h-3 bg-[#20201f] w-32 rounded" />
                            <div className="h-2.5 bg-[#20201f] w-20 rounded" />
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-3.5 bg-[#20201f] w-16 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-3 bg-[#20201f] w-40 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-5 bg-[#20201f] w-16 rounded" /></td>
                        <td className="px-6 py-4" />
                      </tr>
                    ))
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-[#c4c7c8]">
                        <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-full bg-[#131313] border border-[#2a2a2a] flex items-center justify-center text-[#8e9192]">
                            <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-white">No orders found</p>
                            <p className="text-[11px] text-[#8e9192]">
                              Try adjusting your status filter segments or typing a different customer search term.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-white/[0.01] transition-colors group">
                        <td
                          className="px-6 py-3.5 font-mono text-[10px] text-[#b6b2ff] cursor-pointer"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <div className="flex items-center gap-1.5 hover:underline">
                            <Eye className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{o.order_id}</span>
                          </div>
                          <span className="block text-[8px] text-zinc-500 mt-1">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                          <div className="font-medium text-white">{o.customer_name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{o.customer_phone}</div>
                          <div className="text-[9px] text-zinc-500 mt-1 max-w-[180px] break-words line-clamp-1" title={o.shipping_address}>
                            {o.shipping_address}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                          <div className="font-bold text-white">₹{o.total_amount}</div>
                          <span className={cn("text-[9px] font-bold block mt-1 ", o.payment_method === "COD" ? "text-orange-400" : "text-sky-400")}>
                            {o.payment_method}
                          </span>
                          {o.payment_method === "RAZORPAY" && o.seller_payout_amount && (
                            <div className="mt-2 space-y-0.5 border-t border-white/5 pt-1.5 text-[9px] text-zinc-400">
                              <div>Payout from AnyDM: <span className="text-green-400 font-semibold">₹{o.seller_payout_amount}</span></div>
                              {o.total_commission && parseFloat(o.total_commission) > 0 && (
                                <div>Commission: <span className="text-zinc-550">₹{o.total_commission}</span></div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                          {o.items.map((i: any, idx: number) => (
                            <div key={idx} className="text-[10px] text-zinc-300">
                              {i.product_title} <span className="font-bold text-zinc-400">({i.quantity} pcs)</span> {i.variant && <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] border border-white/5 inline-block mt-0.5 ml-1">{i.variant}</span>}
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-3.5 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold ", getStatusColorClass(o.order_status))}>
                            {o.order_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {updatingOrderId === o.order_id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#b6b2ff] inline-block" />
                          ) : (
                            <select
                              value={o.order_status}
                              onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                              className="bg-[#0e0e0e] border border-[#2a2a2a] rounded text-[10px] px-2 py-1 outline-none text-[#e5e2e1]"
                            >
                              <option value="PENDING_PAYMENT">Pending Payment</option>
                              <option value="PAYMENT_RECEIVED">Payment Received</option>
                              <option value="CONFIRMED">Order Confirmed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="PACKED">Packed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Navigation */}
            {!isLoading && filteredOrders.length > 0 && (
              <div className="p-3.5 bg-[#131313] border-t border-[#2a2a2a] flex items-center justify-between text-xs">
                <p className="text-[#8e9192]">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#2a2a2a] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                  </button>
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-white text-black text-xs font-semibold">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#2a2a2a] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AnyDM Payment & Payout Settlements Table */
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1c1b1b] border border-[#2a2a2a] p-3 rounded-t">
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
                {["All", "Pending", "Paid Out", "Refunded"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSettlementFilter(filter)}
                    className={`px-3 h-7 rounded text-xs font-medium transition-colors ${settlementFilter === filter
                      ? "bg-[#20201f] text-white border border-[#2a2a2a] shadow-sm"
                      : "text-[#c4c7c8] hover:text-white border border-transparent"
                      }`}
                  >
                    {filter === "All" ? "All settlements" : filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192] w-3.5 h-3.5" strokeWidth={1.75} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#131313] border border-[#2a2a2a] rounded pl-8 pr-3 h-7 text-xs w-48 focus:border-[#444748] transition-colors text-white placeholder-[#8e9192] outline-none"
                  placeholder="Search settlement..."
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] border border-[#2a2a2a] border-t-0 rounded-b overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#131313] border-b border-[#2a2a2a] text-[#8e9192] font-medium tracking-wide text-[10px]">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Gross Total</th>
                    <th className="px-5 py-3">AnyDM Comm.</th>
                    <th className="px-5 py-3">Gateway Fee</th>
                    <th className="px-5 py-3">Net Payout</th>
                    <th className="px-5 py-3">Payout Mode</th>
                    <th className="px-5 py-3">Settlement Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]/60">
                  {orders.filter(o => o.payment_method === "RAZORPAY").length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-zinc-500 text-xs">
                        No online Razorpay settlements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter(o => {
                        if (o.payment_method !== "RAZORPAY") return false;

                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          const matchesSearch = (
                            o.order_id?.toLowerCase().includes(q) ||
                            o.customer_name?.toLowerCase().includes(q) ||
                            o.customer_phone?.toLowerCase().includes(q)
                          );
                          if (!matchesSearch) return false;
                        }

                        if (settlementFilter === "All") return true;

                        const isRefunded = o.order_status === "REFUNDED" || o.order_status === "CANCELLED";
                        const isPaidOut = !isRefunded && (o.payment_status === "PAID" || o.order_status === "DELIVERED" || o.order_status === "COMPLETED");
                        const isPending = !isRefunded && !isPaidOut;

                        if (settlementFilter === "Pending") return isPending;
                        if (settlementFilter === "Paid Out") return isPaidOut;
                        if (settlementFilter === "Refunded") return isRefunded;

                        return true;
                      })
                      .map((o, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 font-mono font-bold text-white">{o.order_id}</td>
                          <td className="px-5 py-3 text-zinc-300">{o.customer_name}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-400 text-[10px] font-mono font-bold">
                              RAZORPAY
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-white">₹{o.total_amount}</td>
                          <td className="px-5 py-3 text-zinc-400">₹{o.total_commission || "0.00"}</td>
                          <td className="px-5 py-3 text-zinc-400">₹{o.total_razorpay_fee || "0.00"}</td>
                          <td className="px-5 py-3 font-bold text-emerald-400">₹{o.seller_payout_amount || "0.00"}</td>
                          <td className="px-5 py-3">
                            {payoutHoldMode === "INSTANT" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold">
                                ⚡ INSTANT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-400 text-[10px] font-bold">
                                🛡️ MONTHLY HELD
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {o.order_status === "REFUNDED" || o.order_status === "CANCELLED" ? (
                              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-bold">
                                REFUNDED / REVERSED
                              </span>
                            ) : o.payment_status === "PAID" || o.order_status === "DELIVERED" || o.order_status === "COMPLETED" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold">
                                PAID OUT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-400 text-[10px] font-bold">
                                {payoutHoldMode === "MONTHLY" ? "HELD (30D)" : "PENDING RELEASE"}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold border border-white/10 transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      {/* Order Detail Modal (DESIGN.md Glass Monochrome & Inter Font) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto font-sans">
          <div
            className="w-full max-w-2xl rounded-[12px] border border-[#444748] p-6 shadow-2xl bg-[#1c1b1b] text-[#e5e2e1] space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3.5 border-b border-[#444748]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[6px] bg-[#131313] border border-[#444748] text-[#c4c0ff]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2 tracking-tight">
                    <span>Order Details</span>

                    <div
                      onClick={() => {
                        const oid = selectedOrder.order_id;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(oid);
                        } else {
                          const ta = document.createElement("textarea");
                          ta.value = oid;
                          ta.style.position = "fixed";
                          ta.style.opacity = "0";
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand("copy");
                          document.body.removeChild(ta);
                        }
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="font-mono text-xs px-2.5 py-0.5 bg-[#131313] border border-[#444748] hover:border-[#c4c0ff]/60 rounded text-[#c4c7c8] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>{selectedOrder.order_id}</span>
                      {copied ? (
                        <span className="text-[#34d399] text-[10px] font-bold">Copied!</span>
                      ) : (
                        <ClipboardList className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </div>
                  </h3>
                  <p className="text-[11px] text-[#c4c7c8] mt-0.5">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-[4px] hover:bg-[#2a2a2a] text-[#c4c7c8] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Side: Customer & Shipping */}
              <div className="space-y-4">
                <div className="bg-[#131313] p-4 rounded-[8px] border border-[#444748] space-y-2.5">
                  <span className="text-[11px] font-semibold tracking-wider text-[#c4c7c8] uppercase">Customer Info</span>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-white">{selectedOrder.customer_name}</div>
                    {selectedOrder.customer_email && (
                      <div className="text-[#c4c7c8]">{selectedOrder.customer_email}</div>
                    )}
                    <div className="text-[#c4c7c8] font-mono">{selectedOrder.customer_phone}</div>
                  </div>
                </div>

                <div className="bg-[#131313] p-4 rounded-[8px] border border-[#444748] space-y-2.5">
                  <span className="text-[11px] font-semibold tracking-wider text-[#c4c7c8] uppercase">Shipping Details</span>
                  <div className="space-y-1 text-xs leading-relaxed">
                    <p className="text-[#e5e2e1] font-medium">{selectedOrder.shipping_address}</p>
                    {selectedOrder.shipping_pincode && (
                      <p className="text-[#c4c7c8]">Pincode: <span className="font-mono font-bold text-white">{selectedOrder.shipping_pincode}</span></p>
                    )}
                    {(selectedOrder.shipping_place || selectedOrder.shipping_district || selectedOrder.shipping_state) && (
                      <p className="text-[#c4c7c8]">
                        Location: {[selectedOrder.shipping_place, selectedOrder.shipping_district, selectedOrder.shipping_state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Payment & Status */}
              <div className="space-y-4">
                <div className="bg-[#131313] p-4 rounded-[8px] border border-[#444748] space-y-2.5">
                  <span className="text-[11px] font-semibold tracking-wider text-[#c4c7c8] uppercase">Payment &amp; Totals</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#c4c7c8]">Payment Method</span>
                      <span className="font-semibold text-[#c4c0ff]">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#c4c7c8]">Shipping Charge</span>
                      <span className="font-mono font-bold text-white">₹{selectedOrder.shipping_charge || "0.00"}</span>
                    </div>
                    <div className="h-px bg-[#444748]/50 my-1"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#e5e2e1] font-semibold">Total Customer Paid</span>
                      <span className="font-mono font-bold text-white">₹{selectedOrder.total_amount}</span>
                    </div>
                    {selectedOrder.payment_method === "RAZORPAY" && selectedOrder.seller_payout_amount && (
                      <>
                        <div className="h-px bg-[#444748]/50 my-1"></div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#c4c7c8]">AnyDM Commission</span>
                          <span className="font-mono text-[#c4c7c8]">₹{selectedOrder.total_commission || "0.00"}</span>
                        </div>
                        {selectedOrder.total_razorpay_fee && parseFloat(selectedOrder.total_razorpay_fee) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-[#c4c7c8]">Payment Gateway Fee</span>
                            <span className="font-mono text-[#c4c7c8]">₹{selectedOrder.total_razorpay_fee}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-semibold text-[#34d399] mt-1">
                          <span>Payout from AnyDM</span>
                          <span className="font-mono font-bold">₹{selectedOrder.seller_payout_amount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[#131313] p-4 rounded-[8px] border border-[#444748] space-y-3">
                  <span className="text-[11px] font-semibold tracking-wider text-[#c4c7c8] uppercase">Order Management</span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#c4c7c8]">Current Status</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", getStatusColorClass(selectedOrder.order_status))}>
                        {selectedOrder.order_status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-[#c4c7c8]">Change Status</label>
                      {updatingOrderId === selectedOrder.order_id ? (
                        <div className="flex items-center gap-2 text-xs text-[#c4c0ff]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating status...</span>
                        </div>
                      ) : (
                        <select
                          value={selectedOrder.order_status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            await handleStatusChange(selectedOrder.order_id, newStatus);
                            setSelectedOrder((prev: any) => ({ ...prev, order_status: newStatus }));
                          }}
                          className="bg-[#0e0e0e] border border-[#444748] rounded-[4px] text-xs px-3 py-2 outline-none text-[#e5e2e1] w-full focus:border-white transition-colors cursor-pointer"
                        >
                          <option value="PENDING_PAYMENT">Pending Payment</option>
                          <option value="PAYMENT_RECEIVED">Payment Received</option>
                          <option value="CONFIRMED">Order Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      )}
                    </div>

                    {selectedOrder.order_status !== "REFUNDED" && selectedOrder.order_status !== "CANCELLED" && (
                      ((selectedOrder.payment_method || "").toUpperCase() === "RAZORPAY" || (selectedOrder.payment_method || "").toUpperCase() === "ONLINE") ? (
                        (selectedOrder.payment_status || "").toUpperCase() === "PAID" ? (
                          <button
                            type="button"
                            onClick={() => handleRefundOrder(selectedOrder.order_id)}
                            disabled={isRefunding}
                            className="w-full mt-2 py-2 px-3 rounded-[4px] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-[#ffb4ab] text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isRefunding ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Processing Refund &amp; Reversal...</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Issue Refund &amp; Reverse Route Transfer</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="w-full mt-2 p-3 rounded-[4px] bg-[#0e0e0e] border border-[#444748] text-xs text-[#c4c7c8] leading-relaxed">
                            ℹ️ <strong className="text-white">Unpaid Online Order:</strong> Customer has not completed online payment for this order yet. Automated online refunds only apply to completed payments.
                          </div>
                        )
                      ) : (
                        <div className="w-full mt-2 p-3 rounded-[4px] bg-[#0e0e0e] border border-[#444748] text-xs text-[#c4c7c8] leading-relaxed">
                          💡 <strong className="text-white">Cash on Delivery (COD) Order:</strong> Payments are collected directly in cash upon delivery. Automated online refunds only apply to online Razorpay transactions. To cancel or update this order, select <span className="text-white font-semibold">Cancelled</span> in the status dropdown above.
                        </div>
                      )
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary Table */}
            <div className="bg-[#131313] p-4 rounded-[8px] border border-[#444748] space-y-3">
              <span className="text-[11px] font-semibold tracking-wider text-[#c4c7c8] uppercase">Items Summary</span>
              <div className="space-y-2.5">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-[#444748]/50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[4px] bg-[#0e0e0e] border border-[#444748] flex items-center justify-center text-[#c4c7c8] shrink-0 overflow-hidden">
                        {item.product_media_url ? (
                          <img src={item.product_media_url} alt={item.product_title} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#c4c7c8]" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white">{item.product_title}</div>
                        {item.variant && (
                          <div className="text-[10px] text-[#c4c7c8] mt-0.5">
                            Variant: <span className="font-semibold text-[#e5e2e1]">{item.variant}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-white">₹{item.price || (parseFloat(selectedOrder.total_amount) / item.quantity).toFixed(2)}</div>
                      <div className="text-[10px] text-[#c4c7c8] mt-0.5">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Hold Mode Info Modal (DESIGN.md Glass Monochrome & Inter Font) */}
      {showPayoutInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
          <div
            className="w-full max-w-lg rounded-[12px] border border-[#444748] p-6 shadow-2xl bg-[#1c1b1b] text-[#e5e2e1] space-y-5"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#444748]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-[6px] bg-[#131313] border border-[#444748] text-[#c4c0ff]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e5e2e1] tracking-tight">
                    AnyDM Supplier Payout Hold Modes
                  </h3>
                  <p className="text-[11px] text-[#c4c7c8] mt-0.5">
                    Choose how customer checkout payments are settled to your account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutInfoModal(false)}
                className="p-1.5 rounded-[4px] hover:bg-[#2a2a2a] text-[#c4c7c8] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Cards */}
            <div className="space-y-3">
              {/* Instant Payout Card */}
              <div className={cn(
                "p-4 rounded-[8px] border transition-all space-y-2",
                payoutHoldMode === "INSTANT"
                  ? "bg-[#131313] border-[#c4c0ff]/60"
                  : "bg-[#131313] border-[#444748]/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <span>⚡ Instant Payouts (T+1 Daily)</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#c4c0ff]/10 text-[#c4c0ff] border border-[#c4c0ff]/20">
                    Platform Comm: {instantPayoutCommPct}%
                  </span>
                </div>
                <p className="text-xs text-[#c4c7c8] leading-relaxed">
                  Customer payment amounts are routed directly to your verified linked bank account via Razorpay Route upon order checkout. Reversals occur automatically if an order is cancelled or refunded.
                </p>
              </div>

              {/* Monthly Held Payout Card */}
              <div className={cn(
                "p-4 rounded-[8px] border transition-all space-y-2",
                payoutHoldMode === "MONTHLY"
                  ? "bg-[#131313] border-[#c4c0ff]/60"
                  : "bg-[#131313] border-[#444748]/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <span>🛡️ Monthly Held Payouts (30-Day Protection)</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#353535] text-[#c4c7c8] border border-[#444748]">
                    Standard Escrow
                  </span>
                </div>
                <p className="text-xs text-[#c4c7c8] leading-relaxed">
                  Customer payments are safely held in AnyDM platform escrow and released in monthly payout batches to your bank account after delivery confirmation.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPayoutInfoModal(false)}
                className="px-4 py-2 rounded-[4px] text-xs font-semibold bg-white text-[#131313] hover:bg-[#e5e2e1] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}


function getStatusColorClass(status: string) {
  switch (status) {
    case "DELIVERED":
    case "COMPLETED":
      return "bg-green-500/10 border border-green-500/30 text-green-400";
    case "PENDING_PAYMENT":
    case "PENDING":
      return "bg-zinc-500/10 border border-zinc-550 text-zinc-400";
    case "CANCELLED":
    case "PAYMENT_FAILED":
      return "bg-red-500/10 border border-red-500/30 text-red-400";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-500/10 border border-blue-500/30 text-blue-400";
    default:
      return "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400";
  }
}

export default function SellerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" />
          <span className="text-xs text-zinc-400">Loading orders...</span>
        </div>
      }
    >
      <SellerOrdersContent />
    </Suspense>
  );
}

