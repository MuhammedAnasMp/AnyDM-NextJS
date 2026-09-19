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
  ShieldCheck,
  Zap,
  FileText,
  Search,
  MessageCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/services/api.service";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";
import { getStoreHomeUrl, getOrdersUrl, getOrderDetailUrl } from "@/lib/utils/domain";
import UserAvatar from "@/components/UserAvatar";

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

  // UI state
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");
  const [orderFilter, setOrderFilter] = useState<"all" | "progress" | "completed">("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        console.error("Account page load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cleanUsername]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer) clearTimeout(toastTimer);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    setToastTimer(timer);
  };

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
    triggerToast("Customer ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2.5" />
        <span className="text-xs text-zinc-400 font-medium">Loading Dashboard…</span>
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
    : session?.saved_address?.customer_name || "Guest Customer";
  const customerId = session?.token ? session.token.slice(-6).toLowerCase() : "e191f8";

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
            total_amount: lo.total_amount || "15.00",
            product_name: lo.product_name || "Order Item",
            created_at: lo.date || lo.timestamp || lo.created_at || "19 Sep 2026",
          });
        }
      });
    } catch (e) {
      console.error("Error reading local orders:", e);
    }
  }

  const latestOrder = allOrders.length > 0 ? allOrders[0] : null;
  const activeOrdersCount = allOrders.filter(
    (o) => !["DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"].includes((o.order_status || "").toUpperCase())
  ).length;

  // Filtered orders list for order history widget
  const filteredOrders = allOrders.filter((item) => {
    if (orderFilter === "all") return true;
    const status = (item.order_status || "").toUpperCase();
    const isCompleted = ["DELIVERED", "COMPLETED"].includes(status);
    if (orderFilter === "completed") return isCompleted;
    if (orderFilter === "progress") return !isCompleted;
    return true;
  });

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased text-xs sm:text-sm", styles.bodyClass, styles.fontBody)}>
      
      {/* =========================================
           TOP STORE NAVIGATION HEADER
      ========================================== */}
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-md transition-colors shadow-2xs", styles.navClass, styles.dividerClass)}>
        <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-3.5 sm:px-5">
          
          {/* Brand */}
          <Link href={getStoreHomeUrl(cleanUsername)} className="flex items-center gap-2.5">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded text-xs font-bold shrink-0", styles.logoWrapperClass)}>
              {storeSettings?.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeSettings.store_logo} alt={storeName} className="w-full h-full object-cover rounded" />
              ) : (
                <span>{storeName.charAt(0).toLowerCase()}</span>
              )}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className={cn("text-[13px] font-bold tracking-tight", styles.fontHeadline, styles.textColorClass)}>
                {storeName.toLowerCase()}
              </div>
              <div className={cn("text-[8.5px] uppercase tracking-widest opacity-60 font-medium", styles.textMutedClass)}>
                Customer Portal
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={getStoreHomeUrl(cleanUsername)} className={cn("text-xs font-medium transition-opacity opacity-70 hover:opacity-100", styles.textColorClass)}>
              Store
            </Link>
            <button
              onClick={() => triggerToast("Opening Help Center")}
              className={cn("text-xs font-medium transition-opacity opacity-70 hover:opacity-100 cursor-pointer", styles.textColorClass)}
            >
              Help Center
            </button>
            <span className={cn("text-xs font-bold underline underline-offset-4", styles.textColorClass)}>
              Account
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href={getOrdersUrl(cleanUsername)}
              className={cn("hidden sm:inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-85", styles.filterPillClass)}
            >
              <Package className="w-3.5 h-3.5 opacity-80" />
              <span>Orders</span>
              <span className="opacity-60">({allOrders.length})</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className={cn("md:hidden flex h-8 w-8 items-center justify-center rounded border transition-all", styles.filterPillClass)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Avatar Badge */}
            <button
              onClick={() => triggerToast("Account active")}
              aria-label="Account menu"
              className="relative shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <UserAvatar
                src={session?.instagram_profile_pic}
                name={displayName}
                className="w-7.5 h-7.5 text-xs font-semibold rounded-full border border-current/20 shadow-2xs"
                iconClassName="w-3.5 h-3.5"
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={cn("md:hidden border-t px-3.5 py-2 space-y-0.5 animate-in fade-in duration-150", styles.dividerClass)}>
            <Link
              href={getStoreHomeUrl(cleanUsername)}
              onClick={() => setMobileMenuOpen(false)}
              className={cn("block rounded px-2.5 py-2 text-xs opacity-80 hover:opacity-100", styles.textColorClass)}
            >
              Store
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); triggerToast("Opening Help Center"); }}
              className={cn("block w-full text-left rounded px-2.5 py-2 text-xs opacity-80 hover:opacity-100", styles.textColorClass)}
            >
              Help Center
            </button>
            <span className={cn("block rounded px-2.5 py-2 text-xs font-bold bg-white/5", styles.textColorClass)}>
              Account
            </span>
            <Link
              href={getOrdersUrl(cleanUsername)}
              onClick={() => setMobileMenuOpen(false)}
              className={cn("block rounded px-2.5 py-2 text-xs opacity-80 hover:opacity-100", styles.textColorClass)}
            >
              Orders ({allOrders.length})
            </Link>
          </div>
        )}
      </header>

      {/* =========================================
           MAIN CONTAINER (COMPACT MAX-W-6XL)
      ========================================== */}
      <main className="mx-auto max-w-6xl px-3.5 py-4 sm:px-5 sm:py-5 space-y-3.5 flex-1 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <Link
            href={getStoreHomeUrl(cleanUsername)}
            className={cn("inline-flex items-center gap-1.5 opacity-75 hover:opacity-100 font-medium transition-opacity", styles.textColorClass)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </Link>

          <div className={cn("hidden sm:flex items-center gap-1.5 text-[11px] opacity-60 font-medium", styles.textMutedClass)}>
            <span>Customer Profile</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className={cn("font-semibold opacity-100", styles.textColorClass)}>Account Hub</span>
          </div>
        </div>

        {/* =========================================
             PROFILE HEADER CARD (DENSE)
        ========================================== */}
        <section className={cn("overflow-hidden rounded-lg border shadow-2xs", styles.cardClass)}>
          <div className="flex flex-col gap-3.5 p-3.5 sm:p-4.5 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Identity */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <UserAvatar
                  src={session?.instagram_profile_pic}
                  name={displayName}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg text-xl font-bold border border-current/20 shadow-2xs"
                  iconClassName="w-6 h-6"
                />
                {isInstagram && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-0.5 rounded-full text-white shadow-2xs" title="Verified Instagram Session">
                    <InstagramIcon className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={cn("text-base sm:text-lg font-bold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>

                <div className={cn("flex flex-wrap items-center gap-x-2.5 text-[11px] opacity-75 font-medium", styles.textMutedClass)}>
                  <span>{allOrders.length} {allOrders.length === 1 ? "Purchase" : "Purchases"}</span>
                  <span className="opacity-40">•</span>
                  <span>ID: <code className="font-mono text-[10px] font-bold">{customerId}</code></span>
                </div>

                <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active account</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <Link
              href={getOrdersUrl(cleanUsername)}
              className={cn("w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs hover:opacity-90 active:scale-[0.98]", styles.buttonClass)}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Manage Orders</span>
              <ChevronRight className="w-3 h-3 opacity-70" />
            </Link>
          </div>

          {/* Profile Navigation Tabs */}
          <div className={cn("border-t px-3.5 sm:px-4.5", styles.dividerClass)}>
            <div className="flex gap-5 overflow-x-auto">
              <button
                onClick={() => { setActiveTab("overview"); }}
                className={cn(
                  "py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer",
                  activeTab === "overview"
                    ? cn("font-bold border-current", styles.textColorClass)
                    : cn("border-transparent opacity-60 hover:opacity-100", styles.textMutedClass)
                )}
              >
                Overview
              </button>
              <button
                onClick={() => { setActiveTab("orders"); router.push(getOrdersUrl(cleanUsername)); }}
                className={cn(
                  "py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer",
                  activeTab === "orders"
                    ? cn("font-bold border-current", styles.textColorClass)
                    : cn("border-transparent opacity-60 hover:opacity-100", styles.textMutedClass)
                )}
              >
                Orders & Tracking
              </button>
              <button
                onClick={() => { setActiveTab("settings"); triggerToast("Account Settings"); }}
                className={cn(
                  "py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer",
                  activeTab === "settings"
                    ? cn("font-bold border-current", styles.textColorClass)
                    : cn("border-transparent opacity-60 hover:opacity-100", styles.textMutedClass)
                )}
              >
                Account Settings
              </button>
            </div>
          </div>
        </section>

        {/* =========================================
             STATISTICS GRID (ULTRA-COMPACT 1-LINE STATS)
        ========================================== */}
        <section className="grid grid-cols-3 gap-2 sm:gap-3">
          
          {/* Card 1: Total Orders */}
          <div className={cn("p-2 sm:p-2.5 px-3 rounded-lg border shadow-2xs transition-all hover:border-current/20 flex items-center justify-between gap-2", styles.cardClass)}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6.5 h-6.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className={cn("text-[11px] font-semibold truncate leading-tight", styles.textColorClass)}>
                  Total Orders
                </div>
                <div className={cn("text-[9px] opacity-60 font-mono hidden sm:block truncate leading-tight", styles.textMutedClass)}>
                  Lifetime history
                </div>
              </div>
            </div>
            <div className={cn("text-base sm:text-lg font-extrabold shrink-0 tracking-tight", styles.fontHeadline, styles.textColorClass)}>
              {allOrders.length}
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className={cn("p-2 sm:p-2.5 px-3 rounded-lg border shadow-2xs transition-all hover:border-current/20 flex items-center justify-between gap-2", styles.cardClass)}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6.5 h-6.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className={cn("text-[11px] font-semibold truncate leading-tight", styles.textColorClass)}>
                  In Progress
                </div>
                <div className={cn("text-[9px] opacity-60 font-mono hidden sm:block truncate leading-tight", styles.textMutedClass)}>
                  Pending items
                </div>
              </div>
            </div>
            <div className={cn("text-base sm:text-lg font-extrabold shrink-0 tracking-tight text-amber-500", styles.fontHeadline)}>
              {activeOrdersCount}
            </div>
          </div>

          {/* Card 3: Security Status */}
          <div className={cn("p-2 sm:p-2.5 px-3 rounded-lg border shadow-2xs transition-all hover:border-current/20 flex items-center justify-between gap-2", styles.cardClass)}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6.5 h-6.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className={cn("text-[11px] font-semibold truncate leading-tight", styles.textColorClass)}>
                  Account Status
                </div>
                <div className={cn("text-[9px] opacity-60 font-mono hidden sm:block truncate leading-tight", styles.textMutedClass)}>
                  Connected
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-extrabold shrink-0 tracking-tight text-emerald-500">
              Active
            </div>
          </div>

        </section>


        {/* =========================================
             MAIN CONTENT GRID (2 DENSE COLUMNS)
        ========================================== */}
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">

          {/* LEFT: ORDERS & OVERVIEW (8 cols) */}
          <div className="min-w-0 space-y-3.5 lg:col-span-8">

            {/* Latest Purchase Card */}
            <section className={cn("overflow-hidden rounded-lg border shadow-2xs", styles.cardClass)}>
              
              <div className={cn("flex items-center justify-between gap-2 border-b px-3.5 py-3 sm:px-4", styles.dividerClass)}>
                <div>
                  <div className={cn("text-[9px] font-semibold uppercase tracking-wider opacity-60", styles.textMutedClass)}>
                    Overview
                  </div>
                  <h2 className={cn("text-sm font-bold tracking-tight", styles.fontHeadline, styles.textColorClass)}>
                    Latest Purchase
                  </h2>
                </div>

                <Link
                  href={getOrdersUrl(cleanUsername)}
                  className={cn("inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity", styles.filterPillClass)}
                >
                  <span>View all</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3.5 sm:p-4">
                {latestOrder ? (
                  <>
                    {/* Order Summary */}
                    <div className="mb-3.5 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                            <h3 className={cn("text-xs font-bold truncate", styles.textColorClass)}>
                              {latestOrder.product_name || "test product"}
                            </h3>
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                              Paid
                            </span>
                          </div>
                          <p className={cn("font-mono text-[10px] opacity-60 break-all", styles.textMutedClass)}>
                            {latestOrder.order_id}
                          </p>
                        </div>
                      </div>

                      <div className={cn("shrink-0 text-sm font-bold", styles.textColorClass)}>
                        ₹{latestOrder.total_amount || "15.00"}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className={cn("mb-3.5 grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-md border", styles.dividerClass)}>
                      <div className="bg-black/5 dark:bg-white/5 p-2.5">
                        <p className={cn("text-[9.5px] opacity-60 mb-0.5", styles.textMutedClass)}>Payment</p>
                        <p className={cn("text-[11px] font-semibold text-emerald-500")}>Received</p>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-2.5">
                        <p className={cn("text-[9.5px] opacity-60 mb-0.5", styles.textMutedClass)}>Order Date</p>
                        <p className={cn("text-[11px] font-semibold", styles.textColorClass)}>
                          {latestOrder.created_at ? new Date(latestOrder.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "19 Sep 2026"}
                        </p>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-2.5 col-span-2 sm:col-span-1">
                        <p className={cn("text-[9.5px] opacity-60 mb-0.5", styles.textMutedClass)}>Delivery</p>
                        <p className={cn("text-[11px] font-semibold", styles.textColorClass)}>Digital</p>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="mb-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn("font-medium opacity-75 text-[11px]", styles.textColorClass)}>Order progress</span>
                        <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-[10.5px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Processing
                        </span>
                      </div>

                      {/* Bar track */}
                      <div className="w-full h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                        <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
                      </div>

                      <div className={cn("flex justify-between text-[9.5px] opacity-60 pt-0.5 font-medium", styles.textMutedClass)}>
                        <span>Payment</span>
                        <span className="font-semibold opacity-100 text-amber-500">Processing</span>
                        <span>Completed</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <Link
                      href={getOrderDetailUrl(cleanUsername, latestOrder.order_id)}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs hover:opacity-90 active:scale-[0.98]",
                        styles.buttonClass
                      )}
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>Track Package</span>
                      <ChevronRight className="w-3 h-3 opacity-70" />
                    </Link>
                  </>
                ) : (
                  <div className="py-6 text-center space-y-2 max-w-xs mx-auto">
                    <Package className="w-8 h-8 opacity-30 mx-auto" />
                    <p className={cn("text-xs font-bold", styles.textColorClass)}>No Orders Placed Yet</p>
                    <p className={cn("text-[11px] opacity-70 leading-relaxed", styles.textMutedClass)}>
                      When you purchase products from {storeName}, your orders will appear here.
                    </p>
                    <Link
                      href={getStoreHomeUrl(cleanUsername)}
                      className={cn("px-3 py-1.5 text-xs font-semibold rounded-md inline-block mt-1 shadow-2xs transition-all hover:opacity-90", styles.buttonClass)}
                    >
                      Browse Store Products
                    </Link>
                  </div>
                )}
              </div>

            </section>


            {/* Order History Card */}
            <section className={cn("overflow-hidden rounded-lg border shadow-2xs", styles.cardClass)}>
              
              <div className={cn("border-b px-3.5 pt-3 sm:px-4", styles.dividerClass)}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <div className={cn("text-[9px] font-semibold uppercase tracking-wider opacity-60", styles.textMutedClass)}>
                      Activity
                    </div>
                    <h2 className={cn("text-sm font-bold tracking-tight", styles.fontHeadline, styles.textColorClass)}>
                      Order History
                    </h2>
                  </div>

                  <span className={cn("text-[11px] opacity-60 font-medium", styles.textMutedClass)}>
                    {allOrders.length} {allOrders.length === 1 ? "order" : "orders"}
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setOrderFilter("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                      orderFilter === "all"
                        ? styles.filterPillActiveClass
                        : styles.filterPillClass
                    )}
                  >
                    All orders
                  </button>

                  <button
                    onClick={() => setOrderFilter("progress")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                      orderFilter === "progress"
                        ? styles.filterPillActiveClass
                        : styles.filterPillClass
                    )}
                  >
                    In progress
                  </button>

                  <button
                    onClick={() => setOrderFilter("completed")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                      orderFilter === "completed"
                        ? styles.filterPillActiveClass
                        : styles.filterPillClass
                    )}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Order Rows */}
              <div className={cn("divide-y", styles.dividerClass)}>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((item, idx) => {
                    const status = (item.order_status || "CONFIRMED").toUpperCase();
                    const isCompleted = ["DELIVERED", "COMPLETED"].includes(status);

                    return (
                      <Link
                        key={item.order_id || idx}
                        href={getOrderDetailUrl(cleanUsername, item.order_id)}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-black/5 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0 opacity-80">
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0">
                            <p className={cn("truncate text-xs font-semibold", styles.textColorClass)}>
                              {item.product_name || "test product"}
                            </p>
                            <p className={cn("mt-0.5 font-mono text-[9.5px] opacity-60", styles.textMutedClass)}>
                              #{item.order_id} · {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "19 Sep 2026"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className={cn("mb-0.5 text-xs font-bold", styles.textColorClass)}>
                            ₹{item.total_amount || "15.00"}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[9.5px] font-semibold",
                            isCompleted ? "text-emerald-500" : "text-amber-500"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                            {isCompleted ? "Completed" : "Processing"}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className={cn("py-6 text-center text-xs opacity-60", styles.textMutedClass)}>
                    No orders match filter "{orderFilter}".
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={cn("border-t px-3.5 py-2.5 text-center sm:px-4", styles.dividerClass)}>
                <Link
                  href={getOrdersUrl(cleanUsername)}
                  className={cn("inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-all hover:opacity-85", styles.filterPillClass)}
                >
                  <span>Load more orders</span>
                  <span>↓</span>
                </Link>
              </div>

            </section>

          </div>


          {/* RIGHT: ACCOUNT SIDEBAR (4 cols) */}
          <aside className="min-w-0 space-y-3.5 lg:col-span-4">



            {/* Need Help Card */}
            <section className={cn("overflow-hidden rounded-lg border p-3.5 sm:p-4 shadow-2xs space-y-2.5", styles.cardClass)}>
              <div className="w-7.5 h-7.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>

              <div>
                <h3 className={cn("text-xs font-bold tracking-tight mb-0.5", styles.textColorClass)}>
                  Need some help?
                </h3>
                <p className={cn("text-[11px] opacity-75 leading-relaxed", styles.textMutedClass)}>
                  Questions about your order or account? Our support team is here for you.
                </p>
              </div>

              <button
                onClick={() => triggerToast("Opening Contact Support")}
                className={cn("w-full py-1.5 px-2.5 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1 cursor-pointer", styles.filterPillClass)}
              >
                <span>Contact Support</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            </section>

            {/* Quick Links Card */}
            <section className={cn("overflow-hidden rounded-lg border shadow-2xs", styles.cardClass)}>
              <div className={cn("border-b px-3.5 py-2.5 sm:px-4", styles.dividerClass)}>
                <h3 className={cn("text-xs font-bold", styles.textColorClass)}>
                  Quick Links
                </h3>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  href={getOrdersUrl(cleanUsername)}
                  className={cn("flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5", styles.textColorClass)}
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 opacity-70" />
                    <span>Track an order</span>
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Link>

                <Link
                  href={getOrdersUrl(cleanUsername)}
                  className={cn("flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5", styles.textColorClass)}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 opacity-70" />
                    <span>Digital downloads</span>
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Link>

                <button
                  onClick={() => triggerToast("Opening Help Center")}
                  className={cn("flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left cursor-pointer", styles.textColorClass)}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 opacity-70" />
                    <span>Help center</span>
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              </div>
            </section>

          </aside>

        </div>

      </main>

      {/* =========================================
           FOOTER (COMPACT)
      ========================================== */}
      <footer className={cn("mt-6 border-t transition-colors", styles.dividerClass)}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-3.5 py-4 text-center sm:flex-row sm:px-5 sm:text-left">
          <p className={cn("text-[10px] opacity-60", styles.textMutedClass)}>
            © 2026 {storeName.toLowerCase()}. All rights reserved.
          </p>

          <div className={cn("flex items-center gap-4 text-[10px] opacity-60 font-medium", styles.textMutedClass)}>
            <button onClick={() => triggerToast("Privacy Policy")} className="hover:opacity-100 cursor-pointer">
              Privacy
            </button>
            <button onClick={() => triggerToast("Terms of Service")} className="hover:opacity-100 cursor-pointer">
              Terms
            </button>
            <button onClick={() => triggerToast("Support Center")} className="hover:opacity-100 cursor-pointer">
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold shadow-xl animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

    </div>
  );
}
