"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Truck, ArrowLeft, RefreshCw, ShoppingBag, Paperclip, Clipboard, ClipboardList } from "lucide-react";
import Link from "next/link";
import api from "@/lib/services/api.service";

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const steps = [
  { key: "CONFIRMED", label: "Order Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { key: "DELIVERED", label: "Delivered" },
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
        return `/${matched.username}`;
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
        // Remove unreachable order from local storage
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("anydm_customer_orders");
            if (stored) {
              const ordersList = JSON.parse(stored);
              const updatedList = ordersList.filter((o: any) => o.order_id !== orderId);
              localStorage.setItem("anydm_customer_orders", JSON.stringify(updatedList));
            }
          } catch (e) {
            console.error("Error removing invalid order from localStorage:", e);
          }
        }
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
      <div className="min-h-screen bg-[#101012] text-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#b6b2ff]" strokeWidth={1.75} />
        <span className="text-xs text-zinc-400">Fetching delivery status…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#101012] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">!</div>
        <h2 className="text-md font-bold">Tracking Details Unreachable</h2>
        <p className="text-xs text-zinc-400 max-w-sm">{error || "Please verify your Order ID and try again."}</p>
        <Link href={getFallbackStorefrontLink()} className="text-xs font-semibold text-[#b6b2ff] hover:underline flex items-center gap-1.5 mt-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    );
  }

  // Find index of current status in steps
  const getCurrentStepIndex = () => {
    const status = order.order_status;
    if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
    if (status === "COMPLETED") return steps.length - 1;
    const idx = steps.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] py-12 px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-8">

        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#b6b2ff]" />
            <span>Shipment Tracker</span>
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                const oid = order.order_id;
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
              title="Click to copy Order ID"
              className="text-[10px] font-mono bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 px-2.5 py-1 rounded text-zinc-400 cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5 outline-none"
            >
              <span>ID: {order.order_id}</span>
              {copied ? (
                <span className="text-emerald-400 text-[9px] font-bold">Copied!</span>
              ) : (
                <span className="opacity-50 text-[9.5px]"><ClipboardList height={15} width={15} /></span>
              )}
            </button>
            {order.store_username && (
              <Link
                href={`/${order.store_username}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#605ca2] text-white hover:bg-[#605ca2]/90 transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go to Store Home</span>
              </Link>
            )}
          </div>
        </div>

        {/* Status card */}
        <div className="rounded-md bg-[#20201f] border border-white/5 p-6 space-y-6 shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Estimated Delivery</span>
              <div className="text-sm font-bold text-white">Pending dispatch schedule</div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Carrier Status</span>
              <div className="text-xs font-bold uppercase text-[#b6b2ff]">
                {order.order_status.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6 md:gap-0">
            {/* Horizontal Line connector (Desktop only) */}
            <div className="hidden md:block absolute left-4 right-4 h-0.5 bg-white/10 top-[15px] z-0" />

            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2.5 z-10 flex-1 relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border text-xs font-bold shrink-0",
                      isCompleted
                        ? "bg-[#605ca2] border-[#605ca2] text-white"
                        : "bg-[#0e0e0e] border-white/10 text-zinc-600"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold text-center md:max-w-[100px] leading-tight",
                      isCompleted ? "text-white" : "text-zinc-500",
                      isCurrent && "text-[#b6b2ff] font-bold"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Order Summary */}
          <div className="rounded-md bg-[#20201f] border border-white/5 p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Items Details</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div>
                    <div className="font-semibold text-zinc-300">{item.product_title}</div>
                    {item.variant && <span className="text-[9px] text-zinc-500 mt-0.5 block">Variant: {item.variant}</span>}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-bold">₹{item.price}</div>
                    <span className="text-[10px] text-zinc-500">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
              <div className="h-px bg-white/5 pt-2" />
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Total Charged</span>
                <span className="text-[#b6b2ff]">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Delivery & policies details */}
          <div className="rounded-md bg-[#20201f] border border-white/5 p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Shipping Details</h3>
            <div className="space-y-3 text-xs leading-normal">
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500">Recipient Name</span>
                <div className="text-zinc-300 font-semibold">{order.customer_name}</div>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-zinc-500">Shipping Destination</span>
                <div className="text-zinc-400 whitespace-pre-wrap">
                  {order.shipping_address}
                  {order.shipping_pincode && <span className="block mt-1 font-medium text-zinc-300">PIN Code: {order.shipping_pincode}</span>}
                  {(order.shipping_place || order.shipping_district || order.shipping_state) && (
                    <span className="block text-zinc-300">
                      {[order.shipping_place, order.shipping_district, order.shipping_state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div>
                  <span className="text-[9px] font-bold uppercase text-zinc-500 block">Return & Refund Policy</span>
                  <span className={cn("text-[10px] font-bold block mt-0.5", order.return_policy ? "text-green-400" : "text-zinc-400")}>
                    {order.return_policy ? "Returns & exchanges are accepted" : "Returns & exchanges are not accepted"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-zinc-500 block">Cancellation Policy</span>
                  <span className={cn("text-[10px] font-bold block mt-0.5", order.cancellation_policy ? "text-green-400" : "text-zinc-400")}>
                    {order.cancellation_policy ? "Cancellations are allowed before shipment" : "Cancellations are not allowed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
