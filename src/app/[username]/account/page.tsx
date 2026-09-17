"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ExternalLink,
} from "lucide-react";
import api from "@/lib/services/api.service";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";
import { getStoreHomeUrl } from "@/lib/utils/domain";

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

export default function CustomerAccountPage({ params }: PageProps) {
  const { username } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<CustomerSessionData | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "DELIVERED">("ALL");

  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sess, storeRes] = await Promise.all([
          resolveCustomerSession(),
          api.get(`/accounts/public/store/${cleanUsername}/`).catch(() => null)
        ]);

        if (sess) setSession(sess);
        if (storeRes?.data) {
          setStoreSettings(storeRes.data.settings);
          setSupplier(storeRes.data.supplier);
        }
      } catch (err) {
        console.error("Account page load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cleanUsername]);

  const copyToClipboard = (text: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
        <span className="text-xs text-zinc-400">Loading Your Orders…</span>
      </div>
    );
  }

  const styles: TemplateStyle = getTemplateStyles(
    storeSettings?.template_id || "glass_monochrome",
    storeSettings?.theme_id || "default",
    storeSettings?.custom_settings || {}
  );

  const storeName = storeSettings?.store_name || supplier?.full_name || cleanUsername;
  const isInstagram = !!session?.instagram_username;
  const displayName = session?.instagram_username
    ? `@${session.instagram_username}`
    : session?.saved_address?.customer_name || "Customer Account";

  // Merge session orders with browser localStorage orders
  const allOrders: any[] = [...(session?.recent_orders || [])];
  if (typeof window !== "undefined") {
    try {
      const localOrders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      localOrders.forEach((lo: any) => {
        if (lo.order_id && !allOrders.some((o: any) => o.order_id === lo.order_id)) {
          allOrders.push({
            order_id: lo.order_id,
            order_status: lo.order_status || "CONFIRMED",
            total_amount: lo.total_amount || "—",
            product_name: lo.product_name || "Order Item",
            created_at: lo.timestamp
          });
        }
      });
    } catch (e) {
      console.error("Error reading local orders:", e);
    }
  }

  const filteredOrders = allOrders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "DELIVERED") return o.order_status === "DELIVERED" || o.order_status === "COMPLETED";
    if (activeTab === "PROCESSING") return o.order_status !== "DELIVERED" && o.order_status !== "COMPLETED" && o.order_status !== "CANCELLED";
    return true;
  });

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", styles.bodyClass, styles.fontBody)}>

      {/* Top Store Navigation */}
      <header className={cn("sticky top-0 z-40 border-b backdrop-blur-md transition-colors shadow-sm", styles.navClass, styles.dividerClass)}>
        <div className={cn("h-14 flex items-center justify-between gap-3 px-3 sm:px-6 max-w-4xl mx-auto", styles.containerClass)}>

          {/* Left: Store Brand */}
          <Link href={getStoreHomeUrl(cleanUsername)} className="flex items-center gap-2 group min-w-0">
            <div className={cn("w-7.5 h-7.5 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", styles.logoWrapperClass)}>
              {storeSettings?.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeSettings.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <span className={cn("text-xs sm:text-sm font-bold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
              {storeName}
            </span>
          </Link>

          {/* Right: Back to Shop & User Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href={getStoreHomeUrl(cleanUsername)}
              className={cn("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border hover:opacity-80 transition-all shadow-xs", styles.filterPillClass)}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Shop</span>
              <span className="sm:hidden">Shop</span>
            </Link>

            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {session?.instagram_profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.instagram_profile_pic} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </div>
              <span className={cn("text-xs font-bold hidden md:inline truncate max-w-[120px]", styles.textColorClass)}>
                {displayName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">

        {/* Customer Profile Banner */}
        <div className={cn("p-3.5 sm:p-4 rounded-xl border shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", styles.cardClass)}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/20 overflow-hidden shadow-sm shrink-0 bg-zinc-900 flex items-center justify-center">
                {session?.instagram_profile_pic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.instagram_profile_pic} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 opacity-70" />
                )}
              </div>
              {isInstagram && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-0.5 rounded-full text-white shadow-sm" title="Instagram Verified Session">
                  <InstagramIcon className="w-2.5 h-2.5" />
                </div>
              )}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className={cn("text-base sm:text-lg font-bold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
                  {displayName}
                </h1>
                {/* {isInstagram && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    Instagram Account
                  </span>
                )} */}
              </div>
              <p className={cn("text-[11px] opacity-70 flex items-center gap-2 flex-wrap", styles.textMutedClass)}>
                <span>{allOrders.length} {allOrders.length === 1 ? 'Order' : 'Orders'} Placed</span>
                <span>•</span>
                <span>Customer ID: #{session?.token?.slice(-6).toUpperCase() || 'MEM-101'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-current/10 shrink-0">
            <button
              onClick={() => router.push(getStoreHomeUrl(cleanUsername))}
              className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all w-full sm:w-auto text-center active:scale-95 shadow-sm", styles.buttonClass)}
            >
              Browse Products
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={cn("flex items-center justify-between border-b pb-0.5 overflow-x-auto no-scrollbar", styles.dividerClass)}>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "pb-2 px-1 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "ALL"
                  ? "border-current opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              All Orders ({allOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("PROCESSING")}
              className={cn(
                "pb-2 px-1 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "PROCESSING"
                  ? "border-current opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              Active / Processing
            </button>

            <button
              onClick={() => setActiveTab("DELIVERED")}
              className={cn(
                "pb-2 px-1 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "DELIVERED"
                  ? "border-current opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Content Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Left: Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order: any, idx: number) => {
                  const status = (order.order_status || "CONFIRMED").toUpperCase();
                  const isDelivered = status === "DELIVERED" || status === "COMPLETED";
                  const isCancelled = status === "CANCELLED" || status === "REFUNDED";

                  return (
                    <div
                      key={idx}
                      className={cn("rounded-xl border overflow-hidden transition-all shadow-sm", styles.cardClass)}
                    >
                      {/* E-Commerce Order Header Bar */}
                      <div className={cn("px-4 py-2.5 border-b grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-black/5 dark:bg-white/5", styles.dividerClass)}>
                        <div>
                          <span className={cn("text-[9px] uppercase font-bold tracking-wider opacity-60 block", styles.textMutedClass)}>
                            ORDER PLACED
                          </span>
                          <span className={cn("font-bold text-xs", styles.textColorClass)}>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "Recent"}
                          </span>
                        </div>

                        <div>
                          <span className={cn("text-[9px] uppercase font-bold tracking-wider opacity-60 block", styles.textMutedClass)}>
                            TOTAL AMOUNT
                          </span>
                          <span className={cn("font-extrabold text-xs", styles.priceClass)}>
                            ₹{order.total_amount}
                          </span>
                        </div>

                        <div>
                          <span className={cn("text-[9px] uppercase font-bold tracking-wider opacity-60 block", styles.textMutedClass)}>
                            SHIP TO
                          </span>
                          <span className={cn("font-bold text-xs truncate block", styles.textColorClass)}>
                            {session?.saved_address?.customer_name || "Customer"}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className={cn("text-[9px] uppercase font-bold tracking-wider opacity-60 block", styles.textMutedClass)}>
                            ORDER ID
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.order_id)}
                            className={cn("text-xs font-mono font-bold opacity-80 hover:opacity-100 transition-opacity inline-flex items-center gap-1", styles.textColorClass)}
                          >
                            <span>#{order.order_id.slice(-8)}</span>
                            {copiedId === order.order_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-50" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* E-Commerce Order Body */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-current/10">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              isDelivered ? "bg-emerald-500" : isCancelled ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                            )} />
                            <span className={cn("font-bold text-xs sm:text-sm", isDelivered ? "text-emerald-500" : isCancelled ? "text-rose-500" : styles.textColorClass)}>
                              {isDelivered ? "Delivered" : isCancelled ? "Order Cancelled" : status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <span className={cn("text-[10px] sm:text-[11px] font-semibold opacity-70", styles.textMutedClass)}>
                            {isDelivered ? "Handed to resident" : "Standard Express Shipping"}
                          </span>
                        </div>

                        {/* Item Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 opacity-50" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("font-bold text-xs sm:text-sm truncate", styles.textColorClass)}>
                              {order.product_name || "Store Item Purchase"}
                            </h4>
                            <p className={cn("text-[11px] opacity-70 mt-0.5", styles.textMutedClass)}>
                              Order Reference: {order.order_id}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={cn("font-bold text-xs sm:text-sm", styles.priceClass)}>₹{order.total_amount}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2.5 border-t border-current/10 flex items-center justify-end gap-2">
                          <Link
                            href={`/track/${order.order_id}`}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm",
                              styles.buttonClass
                            )}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Package</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={cn("p-8 rounded-xl border text-center space-y-2.5", styles.cardClass)}>
                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto opacity-50">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className={cn("font-bold text-sm", styles.textColorClass)}>No Orders Found</h3>
                <p className={cn("text-xs opacity-70 max-w-sm mx-auto leading-relaxed", styles.textMutedClass)}>
                  You have not placed any orders at {storeName} yet. Start exploring our latest catalog.
                </p>
                <button
                  onClick={() => router.push(getStoreHomeUrl(cleanUsername))}
                  className={cn("px-5 py-2 rounded-lg text-xs font-bold transition-all mt-1 active:scale-95", styles.buttonClass)}
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>

          {/* Right: Delivery Address Book */}
          <div className="space-y-4">
            <div className={cn("p-4 rounded-xl border space-y-3 shadow-sm", styles.cardClass)}>
              <div className={cn("flex justify-between items-center border-b pb-2.5", styles.dividerClass)}>
                <h3 className={cn("text-xs font-bold tracking-wider uppercase flex items-center gap-1.5", styles.textColorClass)}>
                  <MapPin className="w-3.5 h-3.5 opacity-80" />
                  <span>Delivery Address</span>
                </h3>
              </div>

              {session?.saved_address?.shipping_address ? (
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <span className={cn("font-bold text-xs sm:text-sm block", styles.textColorClass)}>
                      {session.saved_address.customer_name}
                    </span>
                    <p className={cn("opacity-80 leading-relaxed text-xs", styles.textColorClass)}>
                      {session.saved_address.shipping_address}
                    </p>
                  </div>

                  <div className={cn("pt-2 border-t space-y-0.5 text-xs opacity-75", styles.dividerClass, styles.textMutedClass)}>
                    {session.saved_address.shipping_pincode && (
                      <p>Pincode: <strong className={styles.textColorClass}>{session.saved_address.shipping_pincode}</strong></p>
                    )}
                    {session.saved_address.customer_phone && (
                      <p>Phone: <strong className={styles.textColorClass}>{session.saved_address.customer_phone}</strong></p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs opacity-70 space-y-0.5">
                  <p className={cn("font-medium", styles.textColorClass)}>No address saved</p>
                  <p className={cn("text-[11px]", styles.textMutedClass)}>Your delivery details will automatically save on your next checkout.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className={cn("border-t py-4 text-center text-xs mt-8 opacity-75", styles.dividerClass, styles.textMutedClass)}>
        <p>© 2026 {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
