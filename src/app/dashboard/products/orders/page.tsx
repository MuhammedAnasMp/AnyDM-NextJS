"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";

export default function SellerOrdersPage() {
  const router = useRouter();
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

  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/crm/seller/orders/");
      if (res.data) {
        setOrders(res.data.orders || []);
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

  useEffect(() => {
    fetchOrders();
  }, []);

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
    { label: "Total amount ordered", val: `₹${totalAmountOrdered}`, meta: "Gross order value", icon: Coins, color: "text-emerald-400" },
    { label: "Paid by AnyDM", val: `₹${stats.total_earnings}`, meta: "Settled payouts", icon: TrendingUp, color: "text-green-400" },
    { label: "Pay by AnyDM (Pending)", val: `₹${stats.pending_settlement}`, meta: "Owed by platform", icon: Coins, color: "text-yellow-400" },
    { label: "Pending orders", val: String(stats.pending_orders), meta: "Awaiting fulfillment", icon: Clock, color: "text-purple-400" },
    { label: "Total orders", val: String(orders.length), meta: "Lifetime count", icon: ShoppingBag, color: "text-blue-400" }
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

      {/* Control Actions & Filter Bar */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-t p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Segments */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-0.5 bg-[#131313] border border-[#2a2a2a] rounded">
            {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 h-7 rounded text-xs font-medium transition-colors ${
                  selectedFilter === filter
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
                      <span className={cn("text-[9px] font-bold block mt-1 uppercase", o.payment_method === "COD" ? "text-orange-400" : "text-sky-400")}>
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
                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase", getStatusColorClass(o.order_status))}>
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

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 p-6 shadow-2xl bg-[#1e1e24] text-white space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#b6b2ff]" />
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Order Details</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-zinc-400">
                      {selectedOrder.order_id}
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Customer & Shipping */}
              <div className="space-y-4">
                <div className="bg-[#131318] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Customer Info</span>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm">{selectedOrder.customer_name}</div>
                    {selectedOrder.customer_email && (
                      <div className="text-zinc-400">{selectedOrder.customer_email}</div>
                    )}
                    <div className="text-zinc-400">{selectedOrder.customer_phone}</div>
                  </div>
                </div>

                <div className="bg-[#131318] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Shipping Details</span>
                  <div className="space-y-1 text-xs leading-relaxed">
                    <p className="text-zinc-300 font-semibold">{selectedOrder.shipping_address}</p>
                    {selectedOrder.shipping_pincode && (
                      <p className="text-zinc-400">Pincode: <span className="font-bold text-white">{selectedOrder.shipping_pincode}</span></p>
                    )}
                    {(selectedOrder.shipping_place || selectedOrder.shipping_district || selectedOrder.shipping_state) && (
                      <p className="text-zinc-400">
                        Location: {[selectedOrder.shipping_place, selectedOrder.shipping_district, selectedOrder.shipping_state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Payment & Status */}
              <div className="space-y-4">
                <div className="bg-[#131318] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Payment &amp; Totals</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Payment Method</span>
                      <span className="font-bold text-[#b6b2ff] uppercase">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Shipping Charge</span>
                      <span className="font-bold text-white">₹{selectedOrder.shipping_charge || "0.00"}</span>
                    </div>
                    <div className="h-px bg-white/5 my-1"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300 font-bold">Total Customer Paid</span>
                      <span className="font-black text-white">₹{selectedOrder.total_amount}</span>
                    </div>
                    {selectedOrder.payment_method === "RAZORPAY" && selectedOrder.seller_payout_amount && (
                      <>
                        <div className="h-px bg-white/5 my-1"></div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-450">AnyDM Commission</span>
                          <span className="text-zinc-400">₹{selectedOrder.total_commission || "0.00"}</span>
                        </div>
                        {selectedOrder.total_razorpay_fee && parseFloat(selectedOrder.total_razorpay_fee) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-450">Payment Gateway Fee</span>
                            <span className="text-zinc-400">₹{selectedOrder.total_razorpay_fee}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold text-green-400 mt-1">
                          <span>Payout from AnyDM</span>
                          <span>₹{selectedOrder.seller_payout_amount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[#131318] p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Order Management</span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Current Status</span>
                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase", getStatusColorClass(selectedOrder.order_status))}>
                        {selectedOrder.order_status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Change Status</label>
                      {updatingOrderId === selectedOrder.order_id ? (
                        <div className="flex items-center gap-2 text-xs text-[#b6b2ff]">
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
                          className="bg-[#0e0e0e] border border-[#444748] rounded text-xs px-2 py-2 outline-none text-[#e5e2e1] w-full"
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
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary Table */}
            <div className="bg-[#131318] p-4 rounded-xl border border-white/5 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Items Summary</span>
              <div className="space-y-2.5">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-zinc-400 font-bold border border-white/5 shrink-0 overflow-hidden">
                        {item.product_media_url ? (
                          <img src={item.product_media_url} alt={item.product_title} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.product_title}</div>
                        {item.variant && (
                          <div className="text-[9px] text-zinc-400 mt-0.5">
                            Variant: <span className="font-semibold text-zinc-300">{item.variant}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{item.price || (parseFloat(selectedOrder.total_amount) / item.quantity).toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
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
