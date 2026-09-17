"use client";

import React, { useState, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import { Check, Truck, ArrowLeft, RefreshCw, ShoppingBag, Copy, Check as CheckIcon, Package, MapPin, CreditCard, MessageCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/services/api.service";
import { getStoreHomeUrl, getAccountUrl } from "@/lib/utils/domain";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const steps = [
  { key: "CONFIRMED", label: "Order Placed", desc: "Order confirmed by seller" },
  { key: "PROCESSING", label: "Processing", desc: "Item being prepared" },
  { key: "PACKED", label: "Packed", desc: "Ready for courier dispatch" },
  { key: "SHIPPED", label: "Shipped", desc: "In transit to destination" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Courier partner delivering today" },
  { key: "DELIVERED", label: "Delivered", desc: "Package handed to recipient" },
];

export default function OrderTrackingPage({ params }: PageProps) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getFallbackStorefrontLink = () => {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      const matched = orders.find((o: any) => o.order_id === orderId);
      if (matched && matched.username) {
        return getStoreHomeUrl(matched.username);
      }
    }
    return "/";
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/crm/store/track/${orderId}/`);
        if (res.data) {
          setOrder(res.data);
        }
      } catch (err: any) {
        console.error("Tracking fetch error:", err);
        setError(err.response?.data?.error || "Order tracking details not found.");
      } finally {
        setIsLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-zinc-400">Loading Tracking Details…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg">!</div>
        <h2 className="text-base font-bold">Tracking Details Unavailable</h2>
        <p className="text-xs text-zinc-400 max-w-sm">{error || "Please check your Order ID and try again."}</p>
        <Link href={getFallbackStorefrontLink()} className="text-xs font-semibold text-white underline flex items-center gap-1.5 mt-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </Link>
      </div>
    );
  }

  const styles: TemplateStyle = getTemplateStyles(
    order.template_id || "glass_monochrome",
    order.theme_id || "default",
    order.custom_settings || {}
  );

  const getCurrentStepIndex = () => {
    const status = (order.order_status || "").toUpperCase();
    if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
    if (status === "COMPLETED" || status === "DELIVERED") return steps.length - 1;
    const idx = steps.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = getCurrentStepIndex();
  const storeName = order.store_name || order.store_username || "Storefront";
  const statusStr = (order.order_status || "CONFIRMED").toUpperCase();
  const isDelivered = statusStr === "DELIVERED" || statusStr === "COMPLETED";
  const isCancelled = statusStr === "CANCELLED" || statusStr === "REFUNDED";

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const instagramUrl = order.store_username
    ? `https://instagram.com/${order.store_username.replace(/^@/, '')}`
    : null;

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", styles.bodyClass, styles.fontBody)}>

      {/* Top Header */}
      <header className={cn("sticky top-0 z-40 border-b backdrop-blur-md transition-colors shadow-sm", styles.navClass, styles.dividerClass)}>
        <div className={cn("h-12 sm:h-14 flex items-center justify-between gap-3 px-3 sm:px-6 max-w-4xl mx-auto", styles.containerClass)}>
          
          <Link href={getStoreHomeUrl(order.store_username)} className="flex items-center gap-2 group min-w-0">
            <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", styles.logoWrapperClass)}>
              {order.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <span className={cn("text-xs sm:text-sm font-bold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
              {storeName}
            </span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={getAccountUrl(order.store_username)}
              className={cn("text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg border hover:opacity-80 transition-all flex items-center gap-1", styles.filterPillClass)}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">

        {/* Status Headline Banner */}
        <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-2", styles.cardClass)}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  isDelivered ? "bg-emerald-500" : isCancelled ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                )} />
                <h1 className={cn("text-sm sm:text-base font-bold tracking-tight truncate", styles.fontHeadline, styles.textColorClass)}>
                  {isDelivered ? "Package Delivered" : isCancelled ? "Order Cancelled" : `Status: ${statusStr.replace(/_/g, " ")}`}
                </h1>
              </div>
              <p className={cn("text-[11px] opacity-75 pl-4.5", styles.textMutedClass)}>
                {isDelivered ? "Handed over to recipient." : "Express Logistics • Delivery in 2-4 business days"}
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-current/10">
              <span className={cn("text-[11px] font-mono opacity-80", styles.textColorClass)}>Order ID:</span>
              <button
                onClick={() => copyToClipboard(order.order_id)}
                className={cn("px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer", styles.inputClass)}
              >
                <span>#{order.order_id.slice(-8)}</span>
                {copied ? (
                  <CheckIcon className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-50" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Shipment Stepper */}
        <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-3", styles.cardClass)}>
          <h2 className={cn("text-[11px] font-bold tracking-wider uppercase border-b pb-1.5 opacity-80", styles.textColorClass, styles.dividerClass)}>
            Package Journey
          </h2>

          {/* Desktop Stepper (md and up) */}
          <div className="hidden md:block relative pt-1">
            <div className="grid grid-cols-6 gap-2 relative z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border text-[10px] font-bold shrink-0 shadow-sm",
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-black font-black"
                          : cn("border-current/20 opacity-40", styles.textColorClass)
                      )}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <span
                        className={cn(
                          "text-[11px] font-bold block leading-tight",
                          isCompleted ? styles.textColorClass : styles.textMutedClass,
                          isCurrent && "text-amber-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Stepper (Vertical list for screens < md) */}
          <div className="md:hidden space-y-2.5 pl-1.5 relative">
            <div className="absolute left-[13px] top-2.5 bottom-2.5 w-0.5 bg-current opacity-15" />

            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex items-start gap-2.5 relative z-10">
                  <div
                    className={cn(
                      "w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-300 border text-[10px] font-bold shrink-0 shadow-sm mt-0.5",
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-black font-black"
                        : cn("border-current/30 opacity-40 bg-black/40 dark:bg-white/10", styles.textColorClass)
                    )}
                  >
                    {isCompleted ? <Check className="w-3 h-3 text-black" strokeWidth={3} /> : idx + 1}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold",
                        isCompleted ? styles.textColorClass : styles.textMutedClass,
                        isCurrent && "text-amber-400"
                      )}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={cn("text-[10px] opacity-70 leading-tight", styles.textMutedClass)}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Items & Delivery Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">

          {/* Left Column (2 cols): Items Summary */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-3", styles.cardClass)}>
              <h3 className={cn("text-[11px] font-bold tracking-wider uppercase border-b pb-2 opacity-80", styles.textColorClass, styles.dividerClass)}>
                Ordered Items ({order.items?.length || 1})
              </h3>

              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => {
                    const displayPrice = (item.price && parseFloat(item.price) > 0) ? item.price : order.total_amount;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 py-1 border-b border-current/5 last:border-0">
                        <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 opacity-50" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className={cn("font-bold text-xs truncate", styles.textColorClass)}>
                            {item.product_title || order.product_name || "Store Item"}
                          </h4>
                          {item.variant && (
                            <p className={cn("text-[10px] opacity-70", styles.textMutedClass)}>
                              Option: {item.variant}
                            </p>
                          )}
                          <p className={cn("text-[10px] opacity-70", styles.textMutedClass)}>
                            Qty: {item.quantity || 1}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn("font-bold text-xs", styles.priceClass)}>
                            ₹{displayPrice}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 border border-current/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 opacity-50" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className={cn("font-bold text-xs truncate", styles.textColorClass)}>
                        {order.product_name || "Store Item Purchase"}
                      </h4>
                      <p className={cn("text-[10px] opacity-70", styles.textMutedClass)}>
                        Qty: 1
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn("font-bold text-xs", styles.priceClass)}>
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className={cn("pt-2 border-t space-y-1 text-xs", styles.dividerClass)}>
                <div className="flex justify-between text-[11px]">
                  <span className={styles.textMutedClass}>Subtotal</span>
                  <span className={cn("font-semibold", styles.textColorClass)}>₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className={styles.textMutedClass}>Shipping Fee</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className={cn("h-px border-t pt-1 flex justify-between text-xs font-bold", styles.dividerClass)}>
                  <span className={styles.textColorClass}>Grand Total</span>
                  <span className={styles.priceClass}>₹{order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col): Delivery Destination & Payment */}
          <div className="space-y-3.5">

            {/* Delivery Destination */}
            <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-2", styles.cardClass)}>
              <h3 className={cn("text-[11px] font-bold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 opacity-80", styles.textColorClass, styles.dividerClass)}>
                <MapPin className="w-3.5 h-3.5 opacity-80" />
                <span>Shipping Destination</span>
              </h3>

              <div className="space-y-1 text-xs">
                <span className={cn("font-bold text-xs block", styles.textColorClass)}>
                  {order.customer_name}
                </span>
                <p className={cn("opacity-80 leading-relaxed text-[11px]", styles.textColorClass)}>
                  {order.shipping_address}
                </p>
                {order.shipping_pincode && (
                  <p className={cn("text-[11px]", styles.textMutedClass)}>
                    Pincode: <strong className={styles.textColorClass}>{order.shipping_pincode}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-2", styles.cardClass)}>
              <h3 className={cn("text-[11px] font-bold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 opacity-80", styles.textColorClass, styles.dividerClass)}>
                <CreditCard className="w-3.5 h-3.5 opacity-80" />
                <span>Payment Details</span>
              </h3>

              <div className="flex justify-between items-center text-xs">
                <span className={styles.textMutedClass}>Payment Mode</span>
                <span className={cn("font-bold px-2 py-0.5 rounded-md border text-[11px]", styles.badgeClass)}>
                  {order.payment_method || "COD / Prepaid"}
                </span>
              </div>
            </div>

            {/* Contact Store Card */}
            {instagramUrl && (
              <div className={cn("p-3 sm:p-4 rounded-xl border shadow-sm space-y-2 text-center", styles.cardClass)}>
                <HelpCircle className="w-4 h-4 mx-auto opacity-50" />
                <h4 className={cn("font-bold text-xs", styles.textColorClass)}>Need help with this order?</h4>
                <p className={cn("text-[10px] opacity-70 leading-tight", styles.textMutedClass)}>
                  Directly message seller on Instagram.
                </p>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 w-full mt-1 shadow-sm", styles.buttonClass)}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message Store</span>
                </a>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className={cn("border-t py-3 text-center text-xs mt-6 opacity-75", styles.dividerClass, styles.textMutedClass)}>
        <p>© 2026 {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

