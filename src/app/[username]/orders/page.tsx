"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveCustomerSession, CustomerSessionData } from "@/lib/services/customerSession";
import {
  User,
  ShoppingBag,
  MapPin,
  Truck,
  ArrowLeft,
  Package,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  FileText,
  Search,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/services/api.service";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";
import { getStoreHomeUrl, getAccountUrl, getOrderDetailUrl } from "@/lib/utils/domain";
import UserAvatar from "@/components/UserAvatar";
import StoreFooter from "@/components/StoreFooter";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface PageProps {
  params: Promise<{ username: string }>;
}

function OrdersContent({ username }: { username: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || searchParams.get("orderId") || "";

  const [session, setSession] = useState<CustomerSessionData | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchOrderId, setSearchOrderId] = useState(initialOrderId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "DELIVERED">("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sess, storeRes] = await Promise.all([
          resolveCustomerSession(cleanUsername),
          api.get(`/accounts/public/store/${cleanUsername}/`).catch(() => null),
        ]);

        if (sess) setSession(sess);
        if (storeRes?.data) {
          setStoreSettings(storeRes.data.settings);
          setSupplier(storeRes.data.supplier);
        }
      } catch (err) {
        console.error("Orders page load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cleanUsername]);

  useEffect(() => {
    if (initialOrderId) {
      router.replace(getOrderDetailUrl(cleanUsername, initialOrderId));
    }
  }, [initialOrderId, cleanUsername, router]);

  // Reset page number on filter/search change (Placed before conditional returns)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, orderSearchQuery]);

  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const styles: TemplateStyle = getTemplateStyles(
    storeSettings?.template_id || "glass_monochrome",
    storeSettings?.theme_id || "default",
    storeSettings?.custom_settings || {}
  );

  const storeName = storeSettings?.store_name || supplier?.full_name || cleanUsername;
  const isInstagram = !!session?.instagram_username;
  const displayName = session?.instagram_username
    ? `@${session.instagram_username}`
    : session?.saved_address?.customer_name || "Guest Customer";

  if (loading) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 font-sans", styles.bodyClass)}>
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70 mb-3" />
        <span className={cn("text-xs font-medium opacity-70", styles.textMutedClass)}>
          Loading Your Orders…
        </span>
      </div>
    );
  }

  // Merge session orders with browser localStorage orders
  const allOrders: any[] = [...(session?.recent_orders || [])];
  if (typeof window !== "undefined") {
    try {
      const localOrders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      localOrders.forEach((lo: any) => {
        const isThisStore = !lo.username || lo.username.toLowerCase() === cleanUsername.toLowerCase();
        if (isThisStore && lo.order_id && !allOrders.some((o: any) => o.order_id === lo.order_id)) {
          allOrders.push({
            order_id: lo.order_id,
            order_status: lo.order_status || "CONFIRMED",
            total_amount: lo.total_amount || "—",
            product_name: lo.product_name || "Order Item",
            created_at: lo.date || lo.timestamp || lo.created_at,
          });
        }
      });
    } catch (e) {
      console.error("Error reading local orders:", e);
    }
  }

  const filteredOrders = allOrders.filter((o) => {
    const status = (o.order_status || "CONFIRMED").toUpperCase();
    const isDelivered = status === "DELIVERED" || status === "COMPLETED";
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "DELIVERED" && isDelivered) ||
      (activeTab === "PROCESSING" && !isDelivered && status !== "CANCELLED");

    const q = orderSearchQuery.trim().toLowerCase();
    if (!q) return matchesTab;

    const matchesId = (o.order_id || "").toLowerCase().includes(q);
    const matchesName = (o.product_name || "").toLowerCase().includes(q);
    const matchesStatus = status.toLowerCase().includes(q);
    const matchesAmount = (o.total_amount || "").toString().toLowerCase().includes(q);

    return matchesTab && (matchesId || matchesName || matchesStatus || matchesAmount);
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchOrderId.trim();
    if (cleanId) {
      router.push(getOrderDetailUrl(cleanUsername, cleanId));
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans antialiased", styles.bodyClass, styles.fontBody)}>

      {/* Top Store Navigation Header */}
      <header className={cn("sticky top-0 z-40 border-b backdrop-blur-md transition-colors shadow-sm", styles.navClass, styles.dividerClass)}>
        <div className={cn("h-14 flex items-center justify-between gap-3 px-3 sm:px-6 max-w-7xl mx-auto", styles.containerClass)}>
          {/* Left: Store Brand */}
          <Link href={getStoreHomeUrl(cleanUsername)} className="flex items-center gap-2 group min-w-0">
            <div className={cn("w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", styles.logoWrapperClass)}>
              {storeSettings?.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeSettings.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <span className={cn("text-xs sm:text-sm font-semibold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
              {storeName}
            </span>
          </Link>

          {/* Right: User Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href={getAccountUrl(cleanUsername)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <UserAvatar
                src={session?.instagram_profile_pic}
                name={displayName}
                className="w-7 h-7 rounded-full text-[11px]"
                iconClassName="w-3.5 h-3.5"
              />
              <span className={cn("text-xs font-medium hidden md:inline truncate max-w-[120px]", styles.textColorClass)}>
                {displayName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 min-h-[70vh]">

        {/* Navigation Actions */}
        <div className="flex items-center justify-between">


          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push(getStoreHomeUrl(cleanUsername));
              }
            }}
            className={cn(
              "inline-flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity",
              styles.textMutedClass
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* <Link
            href={getAccountUrl(cleanUsername)}
            className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:opacity-75 transition-opacity shrink-0", styles.filterPillClass)}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account</span>
          </Link> */}
        </div>

        {/* Main Hero Feature: Direct Order Lookup Card */}
        <div className={cn("p-4 sm:p-5 rounded-xl border space-y-2.5 shadow-xs", styles.cardClass)}>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 opacity-80" />
            <h2 className={cn("text-xs sm:text-sm font-semibold tracking-tight", styles.textColorClass)}>
              Lookup Any Order Status
            </h2>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative w-full">
              <input
                type="text"
                required
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="AMD-2026..."
                className={cn(
                  "w-full px-3.5 py-2 text-xs rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-current/10 focus:border-current/30 transition-all font-normal",
                  styles.textColorClass
                )}
              />
            </div>
            <button
              type="submit"
              disabled={!searchOrderId.trim()}
              className={cn(
                "w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-all disabled:opacity-40 border border-black/10 dark:border-white/15 flex items-center justify-center gap-1.5",
                styles.buttonClass.replace(/\b(py|px|p)-\S+/g, "")
              )}
            >
              <span>Track Order</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-80" />
            </button>
          </form>
        </div>

        {/* Navigation Tabs & Search Bar */}
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2", styles.dividerClass)}>
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "pb-2 px-1 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "ALL"
                  ? "border-current opacity-100 font-semibold"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              All Orders ({allOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("PROCESSING")}
              className={cn(
                "pb-2 px-1 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "PROCESSING"
                  ? "border-current opacity-100 font-semibold"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              Active / Processing
            </button>

            <button
              onClick={() => setActiveTab("DELIVERED")}
              className={cn(
                "pb-2 px-1 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "DELIVERED"
                  ? "border-current opacity-100 font-semibold"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              Delivered
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center w-full sm:w-64">
            <Search className={cn("w-3.5 h-3.5 absolute left-3 pointer-events-none opacity-50", styles.textMutedClass)} />
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="Search orders by ID, product..."
              className={cn(
                "w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border outline-none bg-black/5 dark:bg-white/5 border-current/10 focus:border-current/30 transition-all placeholder:opacity-50",
                styles.textColorClass
              )}
            />
            {orderSearchQuery && (
              <button
                type="button"
                onClick={() => setOrderSearchQuery("")}
                className={cn("absolute right-2 p-0.5 opacity-60 hover:opacity-100 cursor-pointer", styles.textColorClass)}
                aria-label="Clear order search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Left: Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {paginatedOrders.map((order: any, idx: number) => {
                  const status = (order.order_status || "CONFIRMED").toUpperCase();
                  const isDelivered = status === "DELIVERED" || status === "COMPLETED";
                  const isCancelled = status === "CANCELLED" || status === "REFUNDED";

                  return (
                    <div
                      key={idx}
                      className={cn("rounded-xl border overflow-hidden transition-all shadow-xs", styles.cardClass)}
                    >
                      {/* E-Commerce Order Header Bar */}
                      <div className={cn("px-3.5 py-2 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-black/5 dark:bg-white/5", styles.dividerClass)}>
                        <div>
                          <span className={cn("text-[9px] font-normal opacity-60 block uppercase tracking-wider", styles.textMutedClass)}>
                            Order Placed
                          </span>
                          <span className={cn("font-medium text-[11px] sm:text-xs", styles.textColorClass)}>
                            {order.created_at || order.date
                              ? new Date(order.created_at || order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "Recent"}
                          </span>
                        </div>

                        <div>
                          <span className={cn("text-[9px] font-normal opacity-60 block uppercase tracking-wider", styles.textMutedClass)}>
                            Total Paid
                          </span>
                          <span className={cn("font-semibold text-[11px] sm:text-xs", styles.priceClass)}>
                            ₹{order.total_amount}
                          </span>
                        </div>

                        <div>
                          <span className={cn("text-[9px] font-normal opacity-60 block uppercase tracking-wider", styles.textMutedClass)}>
                            Recipient
                          </span>
                          <span className={cn("font-medium text-[11px] sm:text-xs truncate block", styles.textColorClass)}>
                            {session?.saved_address?.customer_name || "Customer"}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className={cn("text-[9px] font-normal opacity-60 block uppercase tracking-wider", styles.textMutedClass)}>
                            Order ID
                          </span>
                          <button
                            onClick={(e) => copyToClipboard(order.order_id, e)}
                            className={cn("text-[11px] sm:text-xs font-mono font-medium opacity-80 hover:opacity-100 transition-opacity inline-flex items-center gap-1 cursor-pointer", styles.textColorClass)}
                          >
                            <span>{order.order_id.length > 12 ? `${order.order_id.slice(0, 4)}...${order.order_id.slice(-4)}` : order.order_id}</span>
                            {copiedId === order.order_id ? (
                              <Check className="w-3.5 h-3.5 opacity-80" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-40" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* E-Commerce Order Body */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-current/10 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              isDelivered ? "bg-black dark:bg-white" : isCancelled ? "bg-rose-500" : "bg-black/40 dark:bg-white/40 animate-pulse"
                            )} />
                            <span className={cn("font-semibold text-xs", styles.textColorClass)}>
                              {isDelivered ? "Delivered" : isCancelled ? "Order Cancelled" : status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <span className={cn("text-[10px] font-normal opacity-60", styles.textMutedClass)}>
                            {isDelivered ? "Handed to recipient" : "Standard Express Fulfill"}
                          </span>
                        </div>

                        {/* Item Info & Actions Inline */}
                        {(() => {
                          const isOnlineOrDigital = Boolean(
                            order.is_digital_order ||
                            order.product_type === "DIGITAL" ||
                            (order.payment_method && (order.payment_method.toUpperCase() === "ONLINE" || order.payment_method.toUpperCase() === "RAZORPAY" || order.payment_method.toUpperCase() === "PREPAID")) ||
                            (order.items && order.items.some((i: any) => i.product_type === "DIGITAL"))
                          );

                          return (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-0.5">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                                  <Package className="w-4 h-4 opacity-50" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className={cn("font-semibold text-xs sm:text-sm truncate", styles.textColorClass)}>
                                    {order.product_name || "Store Item Purchase"}
                                  </h4>
                                  <p className={cn("text-[10px] opacity-60 font-mono font-normal", styles.textMutedClass)}>
                                    Ref: {order.order_id}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-current/10">
                                <span className={cn("font-semibold text-xs sm:text-sm", styles.priceClass)}>₹{order.total_amount}</span>
                                <Link
                                  href={getOrderDetailUrl(cleanUsername, order.order_id)}
                                  className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-all hover:opacity-90 active:scale-[0.98] inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-black/10 dark:border-white/15",
                                    styles.buttonClass.replace(/\b(py|px|p)-\S+/g, "")
                                  )}
                                >
                                  {isOnlineOrDigital ? (
                                    <span>View Content</span>
                                  ) : (
                                    <>
                                      <Truck className="w-3.5 h-3.5 shrink-0" />
                                      <span>Track Package</span>
                                    </>
                                  )}
                                </Link>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t", styles.dividerClass)}>
                    <div className={cn("text-xs opacity-70 font-medium", styles.textMutedClass)}>
                      Showing <span className={cn("font-semibold opacity-100", styles.textColorClass)}>{startIndex + 1}</span>–<span className={cn("font-semibold opacity-100", styles.textColorClass)}>{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of <span className={cn("font-semibold opacity-100", styles.textColorClass)}>{filteredOrders.length}</span> orders
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={cn(
                          "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed border cursor-pointer",
                          styles.filterPillClass
                        )}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center",
                              currentPage === pageNum
                                ? styles.buttonClass
                                : cn("hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100", styles.textColorClass)
                            )}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={cn(
                          "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed border cursor-pointer",
                          styles.filterPillClass
                        )}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={cn("p-8 rounded-xl border text-center space-y-2.5", styles.cardClass)}>
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto opacity-50">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className={cn("font-bold text-sm", styles.textColorClass)}>
                  {orderSearchQuery ? `No orders match "${orderSearchQuery}"` : "No Orders Found"}
                </h3>
                <p className={cn("text-xs opacity-70 max-w-sm mx-auto leading-relaxed", styles.textMutedClass)}>
                  {orderSearchQuery
                    ? "Try searching with a different order ID, product name, or status."
                    : `You have not placed any orders at ${storeName} yet. Or enter your Order Reference ID on the right.`}
                </p>
                {orderSearchQuery ? (
                  <button
                    onClick={() => setOrderSearchQuery("")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-black/10 dark:border-white/10 transition-opacity hover:opacity-75 cursor-pointer mt-1 inline-flex items-center justify-center gap-1.5",
                      styles.textColorClass
                    )}
                  >
                    <span>Clear Search Filter</span>
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(getStoreHomeUrl(cleanUsername))}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium border border-black/10 dark:border-white/10 transition-opacity hover:opacity-75 cursor-pointer mt-1 inline-flex items-center justify-center gap-1.5",
                      styles.textColorClass
                    )}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 opacity-80" />
                    <span>Start Shopping</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Delivery Address & Highlights */}
          <div className="space-y-4">

            {/* Delivery Address Book Card */}
            <div className={cn("p-4 rounded-xl border space-y-3 shadow-xs", styles.cardClass)}>
              <div className={cn("flex justify-between items-center border-b pb-2.5", styles.dividerClass)}>
                <h3 className={cn("text-xs font-semibold flex items-center gap-1.5", styles.textColorClass)}>
                  <MapPin className="w-3.5 h-3.5 opacity-80" />
                  <span>Delivery Address</span>
                </h3>
              </div>

              {session?.saved_address?.shipping_address ? (
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <span className={cn("font-semibold text-xs sm:text-sm block", styles.textColorClass)}>
                      {session.saved_address.customer_name}
                    </span>
                    <p className={cn("opacity-80 leading-relaxed text-xs font-normal", styles.textColorClass)}>
                      {session.saved_address.shipping_address}
                    </p>
                  </div>

                  <div className={cn("pt-2 border-t space-y-0.5 text-xs opacity-75 font-normal", styles.dividerClass, styles.textMutedClass)}>
                    {session.saved_address.shipping_pincode && (
                      <p>Pincode: <span className={cn("font-medium", styles.textColorClass)}>{session.saved_address.shipping_pincode}</span></p>
                    )}
                    {session.saved_address.customer_phone && (
                      <p>Phone: <span className={cn("font-medium", styles.textColorClass)}>{session.saved_address.customer_phone}</span></p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs opacity-70 space-y-0.5">
                  <p className={cn("font-medium", styles.textColorClass)}>No address saved</p>
                  <p className={cn("text-[11px] font-normal", styles.textMutedClass)}>Your delivery details will automatically save on your next checkout.</p>
                </div>
              )}
            </div>

            {/* Store Guarantee / Feature highlights */}
            <div className={cn("p-4 rounded-xl border space-y-3 shadow-xs text-xs", styles.cardClass)}>
              <div className={cn("flex items-center gap-2.5 opacity-80", styles.textColorClass)}>
                <Truck className="w-4 h-4 shrink-0 opacity-70" />
                <span className="font-medium text-xs">Live Shipment Updates</span>
              </div>
              <div className={cn("flex items-center gap-2.5 opacity-80", styles.textColorClass)}>
                <Zap className="w-4 h-4 shrink-0 opacity-70" />
                <span className="font-medium text-xs">Instant Digital Downloads</span>
              </div>
              <div className={cn("flex items-center gap-2.5 opacity-80", styles.textColorClass)}>
                <FileText className="w-4 h-4 shrink-0 opacity-70" />
                <span className="font-medium text-xs">Official PDF Tax Invoices</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <StoreFooter username={cleanUsername} storeSettings={storeSettings} supplier={supplier} styles={styles} />
    </div>
  );
}

export default function SupplierOrdersPage({ params }: PageProps) {
  const { username } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#131313] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
          <span className="text-xs text-zinc-400 font-mono">Loading Your Orders…</span>
        </div>
      }
    >
      <OrdersContent username={username} />
    </Suspense>
  );
}


