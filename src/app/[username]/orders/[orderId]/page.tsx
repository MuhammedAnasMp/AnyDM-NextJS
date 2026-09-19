"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  Check,
  Check as CheckIcon,
  Copy,
  Zap,
  Download,
  FileText,
  Video,
  Printer,
  Lock,
  ShieldCheck,
  User,
  MapPin,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Truck,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import api from "@/lib/services/api.service";
import { resolveCustomerSession, initCustomerSessionFromUrl, CustomerSessionData } from "@/lib/services/customerSession";
import { getTemplateStyles, TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";
import { getStoreHomeUrl, getOrdersUrl, getAccountUrl } from "@/lib/utils/domain";

const steps = [
  { key: "CONFIRMED", label: "Order Placed", desc: "Order confirmed by seller" },
  { key: "PROCESSING", label: "Processing", desc: "Item being prepared" },
  { key: "PACKED", label: "Packed", desc: "Ready for courier dispatch" },
  { key: "SHIPPED", label: "Shipped", desc: "In transit to destination" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Courier partner delivering today" },
  { key: "DELIVERED", label: "Delivered", desc: "Package handed to recipient" },
];

interface PageProps {
  params: Promise<{
    username: string;
    orderId: string;
  }>;
}

export default function SupplierSpecificOrderDetailsPage({ params }: PageProps) {
  const { username, orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [customerSession, setCustomerSession] = useState<CustomerSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);

  const [isDeviceAuthorized, setIsDeviceAuthorized] = useState(false);
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");

  useEffect(() => {
    async function loadOrderData() {
      setLoading(true);
      setError(null);

      const urlCsToken = searchParams.get("cs") || searchParams.get("token") || searchParams.get("session") || initCustomerSessionFromUrl();

      try {
        const [orderRes, storeRes, sessData] = await Promise.all([
          api.get(`/crm/store/track/${orderId}/`).catch((e) => e.response),
          api.get(`/accounts/public/store/${cleanUsername}/`).catch(() => null),
          resolveCustomerSession(cleanUsername).catch(() => null),
        ]);

        if (sessData) setCustomerSession(sessData);

        if (orderRes?.data && (orderRes.status === 200 || !orderRes.status)) {
          setOrder(orderRes.data);
        } else {
          setError(orderRes?.data?.error || "Order tracking reference not found.");
        }

        if (storeRes?.data) {
          setStoreSettings(storeRes.data.settings);
          setSupplier(storeRes.data.supplier);
        }
      } catch (err: any) {
        console.error("Order load error:", err);
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadOrderData();
    }
  }, [cleanUsername, orderId, searchParams]);

  useEffect(() => {
    if (!order || typeof window === "undefined") return;

    try {
      const urlCsToken = searchParams.get("cs") || searchParams.get("token") || searchParams.get("session");
      const activeCsToken = localStorage.getItem(`anydm_customer_session_token_${cleanUsername}`) || localStorage.getItem("anydm_customer_session_token");
      const storedOrders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");

      const localMatch = storedOrders.some(
        (o: any) => o.order_id === order.order_id || (o.tracking_token && o.tracking_token === order.tracking_token)
      );

      const tokenMatch = Boolean(
        (urlCsToken && (urlCsToken === order.customer_session_token || urlCsToken === order.tracking_token)) ||
        (activeCsToken && (activeCsToken === order.customer_session_token || activeCsToken === order.tracking_token))
      );

      const sessionMatch = Boolean(
        (customerSession?.token && (customerSession.token === order.customer_session_token || customerSession.token === order.tracking_token)) ||
        (customerSession?.instagram_username && order.instagram_username && customerSession.instagram_username.toLowerCase() === order.instagram_username.toLowerCase()) ||
        (customerSession?.saved_address?.customer_email && order.customer_email && customerSession.saved_address.customer_email.toLowerCase() === order.customer_email.toLowerCase()) ||
        (customerSession?.saved_address?.customer_phone && order.customer_phone && customerSession.saved_address.customer_phone.replace(/\D/g, "").includes(order.customer_phone.replace(/\D/g, "")))
      );

      const isInstagramUrlToken = Boolean(urlCsToken && urlCsToken.startsWith("cs_"));
      const isDownloadInvoiceUrl = Boolean(
        searchParams.get("downloadInvoice") === "true" ||
        searchParams.get("autoInvoice") === "true"
      );

      if (localMatch || tokenMatch || sessionMatch || isInstagramUrlToken || isDownloadInvoiceUrl) {
        setIsDeviceAuthorized(true);

        if (!storedOrders.some((o: any) => o.order_id === order.order_id)) {
          storedOrders.unshift({
            order_id: order.order_id,
            username: cleanUsername,
            tracking_token: order.tracking_token,
            date: order.created_at || new Date().toISOString(),
            total_amount: order.total_amount,
            order_status: order.order_status,
            product_name: order.items?.[0]?.product_title || order.product_name || "Digital Item",
            authorized: true,
          });
          localStorage.setItem("anydm_customer_orders", JSON.stringify(storedOrders));
        }
      }
    } catch (e) {
      console.error("Error evaluating device authorization", e);
    }
  }, [order, customerSession, searchParams, cleanUsername]);

  const handleUnlockDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    const val = unlockInput.trim().toLowerCase();
    if (!val || !order) return;

    const emailMatch = Boolean(order.customer_email && order.customer_email.toLowerCase() === val);
    const phoneMatch = Boolean(
      order.customer_phone && order.customer_phone.replace(/\D/g, "").includes(val.replace(/\D/g, ""))
    );
    const pincodeMatch = Boolean(order.shipping_pincode && order.shipping_pincode === val);
    const tokenMatch = Boolean(
      (order.tracking_token && order.tracking_token.toLowerCase() === val) ||
      (order.order_id && order.order_id.toLowerCase() === val)
    );

    if (emailMatch || phoneMatch || pincodeMatch || tokenMatch) {
      try {
        const stored = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
        if (!stored.some((o: any) => o.order_id === order.order_id)) {
          stored.unshift({
            order_id: order.order_id,
            username: cleanUsername,
            tracking_token: order.tracking_token,
            date: order.created_at || new Date().toISOString(),
            total_amount: order.total_amount,
            order_status: order.order_status,
            product_name: order.items?.[0]?.product_title || order.product_name || "Digital Item",
            authorized: true,
          });
          localStorage.setItem("anydm_customer_orders", JSON.stringify(stored));
        }
      } catch (err) {
        console.error("Save authorization error:", err);
      }
      setIsDeviceAuthorized(true);
      setUnlockInput("");
    } else {
      setUnlockError("Verification failed. Please enter the exact Email or Phone used when purchasing this item.");
    }
  };

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

  const handleDownloadInvoice = async () => {
    if (!order) return;
    const storeNameStr = storeSettings?.store_name || supplier?.full_name || cleanUsername;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "794px";
    container.style.padding = "40px";
    container.style.boxSizing = "border-box";
    container.style.background = "#ffffff";
    container.style.color = "#111111";
    container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    container.style.lineHeight = "1.5";

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; color: #111; margin: 0;">${storeNameStr}</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Official Purchase Receipt & Tax Invoice</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; padding: 4px 12px; background: #e6f4ea; color: #137333; font-weight: bold; border-radius: 4px; font-size: 12px;">Paid • Verified</span>
          <p style="margin: 6px 0 0 0; font-size: 13px; font-family: monospace; font-weight: bold;">Order ID: ${order.order_id}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px;">Store & Seller Info</div>
          <div><strong>${storeNameStr}</strong></div>
          <div>Store Username: @${cleanUsername}</div>
          <div>Date: ${new Date(order.created_at || Date.now()).toLocaleString()}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px;">Payment Details</div>
          <div>Payment Status: <strong>${(order.payment_status || "PAID").toUpperCase()}</strong></div>
          <div>Payment Method: <strong>${order.payment_method || "Online Payment"}</strong></div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 12px 8px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #555;">Item Description</th>
            <th style="text-align: left; padding: 12px 8px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #555;">Type</th>
            <th style="text-align: left; padding: 12px 8px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #555;">Qty</th>
            <th style="text-align: right; padding: 12px 8px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #555;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items && order.items.length > 0 ? order.items : [{ product_title: order.product_name || "Store Item", quantity: 1, price: order.total_amount, product_type: "DIGITAL" }]).map((item: any) => `
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px;"><strong>${item.product_title || "Item"}</strong>${item.variant ? `<br><small style="color:#666">Option: ${item.variant}</small>` : ''}</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px;"><span style="font-size: 11px; font-weight: bold;">${item.product_type || 'DIGITAL'}</span></td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px;">${item.quantity || 1}</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">₹${item.price || order.total_amount}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="3" style="padding: 12px 8px; font-weight: bold; font-size: 16px; border-top: 2px solid #111;">Grand Total Paid</td>
            <td style="padding: 12px 8px; font-weight: bold; font-size: 16px; border-top: 2px solid #111; text-align: right;">₹${order.total_amount}</td>
          </tr>
        </tbody>
      </table>

      ${order.digital_items && order.digital_items.length > 0 ? `
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 16px; border-radius: 8px; margin-bottom: 30px; font-size: 13px;">
          <h3 style="margin-top:0; font-size: 14px; color: #111;">Digital Access Deliverables Included</h3>
          <p style="margin-bottom: 8px;">The following digital media download links are attached to this purchase:</p>
          <ul>
            ${order.digital_items.flatMap((di: any) => (di.digital_resources || []).map((res: any) => `<li><strong>${res.title}</strong> (${res.type}) - ${res.url}</li>`)).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
        <p style="margin: 0 0 4px 0;">Thank you for purchasing with ${storeNameStr}!</p>
        <p style="margin: 0; font-size: 11px; opacity: 0.7;">Powered by AnyDM Social Commerce</p>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${order.order_id}.pdf`);
    } catch (err) {
      console.error("PDF Invoice generation error:", err);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  useEffect(() => {
    if (order && !loading && !hasAutoDownloaded) {
      const isAutoInvoice = searchParams.get("downloadInvoice") === "true" || searchParams.get("autoInvoice") === "true";
      if (isAutoInvoice) {
        setHasAutoDownloaded(true);
        handleDownloadInvoice();

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("downloadInvoice");
          url.searchParams.delete("autoInvoice");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      }
    }
  }, [order, loading, searchParams, hasAutoDownloaded]);

  const styles: TemplateStyle = getTemplateStyles(
    storeSettings?.template_id || order?.template_id || "glass_monochrome",
    storeSettings?.theme_id || order?.theme_id || "default",
    storeSettings?.custom_settings || order?.custom_settings || {}
  );

  const storeName = storeSettings?.store_name || supplier?.full_name || cleanUsername;

  if (loading) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 font-sans", styles.bodyClass)}>
        <div className="w-7 h-7 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70 mb-3" />
        <span className={cn("text-xs font-medium opacity-70", styles.textMutedClass)}>
          Loading order details...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans", styles.bodyClass)}>
        <div className="w-10 h-10 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-lg">!</div>
        <h2 className={cn("text-base font-semibold tracking-tight", styles.textColorClass)}>Order Details Unavailable</h2>
        <p className={cn("text-xs opacity-75 max-w-sm leading-relaxed", styles.textMutedClass)}>{error || "Order ID not found."}</p>
        <Link href={getOrdersUrl(cleanUsername)} className={cn("text-xs font-medium px-4 py-2 rounded-md border flex items-center gap-1.5 shadow-xs transition-all", styles.buttonClass)}>
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Search</span>
        </Link>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    const status = (order.order_status || "").toUpperCase();
    if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
    if (status === "COMPLETED" || status === "DELIVERED") return steps.length - 1;
    const idx = steps.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStepIdx = getCurrentStepIndex();
  const statusStr = (order?.order_status || "CONFIRMED").toUpperCase();
  const isDelivered = statusStr === "DELIVERED" || statusStr === "COMPLETED";
  const isCancelled = statusStr === "CANCELLED" || statusStr === "REFUNDED";

  const hasDigitalItems = Boolean(order?.digital_items && order.digital_items.length > 0);
  const hasPhysicalItems = Boolean(
    order?.items?.some((i: any) => i.product_type === "PHYSICAL" || (!i.product_type && !hasDigitalItems))
  );
  const isPurelyDigital = order?.is_digital_order || (hasDigitalItems && !hasPhysicalItems);

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased", styles.bodyClass)}>

      {/* Header */}
      <header className={cn("sticky top-0 z-40 border-b backdrop-blur-md transition-colors shadow-xs", styles.navClass, styles.dividerClass)}>
        <div className={cn("h-14 flex items-center justify-between gap-3 px-4 sm:px-6 max-w-5xl mx-auto", styles.containerClass)}>
          <Link href={getStoreHomeUrl(cleanUsername)} className="flex items-center gap-2.5 group min-w-0">
            <div className={cn("w-8 h-8 rounded-md overflow-hidden border flex items-center justify-center shrink-0", styles.logoWrapperClass)}>
              {storeSettings?.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeSettings.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className={cn("text-xs sm:text-sm font-semibold tracking-tight truncate block leading-none", styles.textColorClass)}>
                {storeName}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={getOrdersUrl(cleanUsername)}
              className={cn(styles.filterPillClass, "hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:opacity-80 transition-all")}
            >
              <Package className="w-3.5 h-3.5 opacity-80" />
              <span>All Orders</span>
            </Link>
            <Link
              href={getAccountUrl(cleanUsername)}
              className={cn(styles.filterPillClass, "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:opacity-80 transition-all")}
            >
              <User className="w-3.5 h-3.5 opacity-80" />
              <span>Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 border-b pb-3 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push(getOrdersUrl(cleanUsername));
                }
              }}
              className={cn(styles.filterPillClass, "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:opacity-80 transition-all shrink-0 cursor-pointer")}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <Link
              href={getOrdersUrl(cleanUsername)}
              className={cn(styles.filterPillClass, "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:opacity-80 transition-all shrink-0 sm:hidden")}
            >
              <Package className="w-3.5 h-3.5" />
              <span>All Orders</span>
            </Link>
          </div>

          <button
            onClick={handleDownloadInvoice}
            className={cn(styles.filterPillClass, "px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-80 cursor-pointer border border-black/10 dark:border-white/10 shadow-xs")}
            title="Download PDF Invoice"
          >
            <Printer className="w-3.5 h-3.5 opacity-80" />
            <span>Download Invoice</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left Main Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">

            {/* Status Hero Card */}
            <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-4", styles.cardClass)}>
              <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4", styles.dividerClass)}>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      isCancelled ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <h1 className={cn("text-base sm:text-lg font-semibold tracking-tight truncate", styles.textColorClass)}>
                      {isCancelled
                        ? "Order Cancelled"
                        : isPurelyDigital
                          ? "Digital Deliverables Unlocked"
                          : isDelivered
                            ? "Package Delivered"
                            : `Order ${statusStr.replace(/_/g, " ")}`}
                    </h1>
                  </div>
                  <p className={cn("text-xs opacity-75 pl-4 leading-relaxed max-w-lg", styles.textMutedClass)}>
                    {isCancelled
                      ? "This transaction was cancelled or refunded."
                      : isPurelyDigital
                        ? "Your digital files and access resources are unlocked below."
                        : isDelivered
                          ? "Your order package has been successfully delivered."
                          : "Preparing and courier fulfillment in progress."}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(order.order_id)}
                  className={cn(
                    styles.filterPillClass,
                    "px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all hover:opacity-80 cursor-pointer shrink-0"
                  )}
                  title="Copy Order ID"
                >
                  <span>{order.order_id}</span>
                  {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-50" />}
                </button>
              </div>

              {/* Order Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-0.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider block opacity-60", styles.textMutedClass)}>Order Date</span>
                  <span className={cn("font-medium text-xs block truncate", styles.textColorClass)}>
                    {new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <div className="p-3 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-0.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider block opacity-60", styles.textMutedClass)}>Payment Status</span>
                  <span className={cn("font-semibold text-xs flex items-center gap-1 truncate", isCancelled ? "text-rose-400" : "text-emerald-400")}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {(order.payment_status || "PAID").toUpperCase()}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-0.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider block opacity-60", styles.textMutedClass)}>Delivery Method</span>
                  <span className={cn("font-medium text-xs truncate block", styles.textColorClass)}>
                    {isPurelyDigital ? "Instant Digital Download" : "Standard Doorstep Delivery"}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Downloads Section */}
            {hasDigitalItems && (
              isDeviceAuthorized ? (
                <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-4", styles.cardClass)}>
                  <div className={cn("border-b pb-3 flex items-center justify-between gap-3", styles.dividerClass)}>
                    <div>
                      <h2 className={cn("text-sm font-semibold flex items-center gap-2", styles.textColorClass)}>
                        <Zap className="w-4 h-4 opacity-80 text-amber-400" />
                        Digital Deliverables
                      </h2>
                      <p className={cn("text-xs opacity-70 mt-0.5", styles.textMutedClass)}>
                        Access files, media, and resources for your confirmed purchase:
                      </p>
                    </div>
                  </div>

                  {order.digital_items.map((digItem: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <p className={cn("text-xs font-semibold opacity-90", styles.textColorClass)}>{digItem.title}</p>

                      {digItem.digital_access_instructions && (
                        <div className={cn("p-3.5 border border-black/10 dark:border-white/10 rounded-md text-xs space-y-1 bg-black/5 dark:bg-white/5", styles.dividerClass)}>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 block">Access Instructions</span>
                          <p className={cn("whitespace-pre-line opacity-85 leading-relaxed text-xs", styles.textColorClass)}>{digItem.digital_access_instructions}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(digItem.digital_resources || []).map((res: any, rIdx: number) => (
                          <div key={rIdx} className={cn("p-3 rounded-md border border-black/10 dark:border-white/10 flex items-center justify-between gap-3 bg-black/5 dark:bg-white/5 transition-all hover:border-black/20 dark:hover:border-white/20", styles.dividerClass)}>
                            <div className="min-w-0 flex items-center gap-2.5">
                              {res.thumbnail_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={res.thumbnail_url} alt="" className="w-8 h-8 rounded object-cover border border-black/10 dark:border-white/10 shrink-0" />
                              ) : res.type === "LINK" ? (
                                <div className="w-8 h-8 rounded border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 bg-sky-500/10 text-sky-400">
                                  <Video className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-400">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className={cn("text-xs font-medium truncate", styles.textColorClass)}>{res.title}</p>
                                <p className={cn("text-[10px] opacity-60 truncate font-mono", styles.textMutedClass)}>{res.type === "FILE" ? "File Download" : "Resource Link"}</p>
                              </div>
                            </div>

                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className={cn("px-3 py-1.5 rounded text-xs font-semibold shrink-0 flex items-center gap-1 transition-all hover:opacity-80 cursor-pointer border border-black/10 dark:border-white/10 shadow-xs", styles.filterPillClass)}
                            >
                              {res.type === "FILE" ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                              <span>{res.type === "FILE" ? "Download" : "Open"}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-3", styles.cardClass)}>
                  <div className={cn("border-b pb-3", styles.dividerClass)}>
                    <h2 className={cn("text-sm font-semibold flex items-center gap-2", styles.textColorClass)}>
                      <Lock className="w-4 h-4 opacity-80 text-amber-400" />
                      Device Verification Required
                    </h2>
                    <p className={cn("text-xs opacity-75 mt-0.5", styles.textMutedClass)}>
                      Verify your buyer identity to access digital deliverables on this device.
                    </p>
                  </div>

                  <div className={cn("p-4 border border-black/10 dark:border-white/10 rounded-md text-xs space-y-3 bg-black/5 dark:bg-white/5", styles.dividerClass)}>
                    <p className={cn("font-normal leading-relaxed opacity-85", styles.textColorClass)}>
                      Enter the Email address or Phone number used when placing this order.
                    </p>

                    <form onSubmit={handleUnlockDevice} className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          required
                          value={unlockInput}
                          onChange={(e) => setUnlockInput(e.target.value)}
                          placeholder="Email or Phone Number"
                          className={cn("flex-1 text-xs rounded-md px-3 py-2 border border-black/20 dark:border-white/20 outline-none bg-transparent focus:border-current transition-all", styles.textColorClass)}
                        />
                        <button
                          type="submit"
                          className={cn("px-4 py-2 rounded-md text-xs font-semibold shrink-0 cursor-pointer flex items-center justify-center gap-1.5 border border-black/10 dark:border-white/10 transition-all hover:opacity-80 shadow-xs", styles.filterPillClass)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify Device</span>
                        </button>
                      </div>
                      {unlockError && (
                        <p className="text-rose-500 text-[11px] font-medium">{unlockError}</p>
                      )}
                    </form>
                  </div>
                </div>
              )
            )}

            {/* Delivery Progress Timeline (for Physical Orders) */}
            {!isPurelyDigital && (
              <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-5", styles.cardClass)}>
                <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 opacity-70 text-sky-400" />
                    <h2 className={cn("text-xs font-semibold uppercase tracking-wider opacity-85", styles.textColorClass)}>
                      Delivery Progress
                    </h2>
                  </div>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:block relative pt-2 pb-1">
                  <div className="grid grid-cols-6 gap-2 relative z-10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-all border text-xs font-bold shrink-0 shadow-xs",
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "border-black/20 dark:border-white/20 opacity-40 bg-black/5 dark:bg-white/5"
                            )}
                          >
                            {isCompleted ? <Check className="w-4 h-4 text-black" strokeWidth={2.5} /> : idx + 1}
                          </div>
                          <div className="space-y-0.5">
                            <span className={cn(
                              "text-[11px] font-semibold block leading-tight",
                              isCompleted ? styles.textColorClass : styles.textMutedClass,
                              isCurrent && "font-bold opacity-100"
                            )}>
                              {step.label}
                            </span>
                            <span className={cn("text-[9px] opacity-60 block leading-tight", styles.textMutedClass)}>
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Stepper */}
                <div className="md:hidden space-y-3.5 pl-1 relative">
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-black/10 dark:bg-white/10" />
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="flex items-start gap-3 relative z-10">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all border text-[11px] font-semibold shrink-0 mt-0.5",
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-black"
                              : "border-black/20 dark:border-white/20 opacity-40 bg-black/5 dark:bg-white/5"
                          )}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 text-black" strokeWidth={2.5} /> : idx + 1}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <span className={cn("text-xs font-semibold block", isCompleted ? styles.textColorClass : styles.textMutedClass, isCurrent && "font-bold opacity-100")}>
                            {step.label}
                          </span>
                          <p className={cn("text-[11px] opacity-65 leading-tight", styles.textMutedClass)}>{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">

            {/* Order Items & Price Summary Card */}
            <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-4", styles.cardClass)}>
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider border-b pb-3 opacity-85", styles.textColorClass, styles.dividerClass)}>
                Order Items ({order.items?.length || 1})
              </h3>

              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 opacity-60" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className={cn("font-semibold text-xs truncate", styles.textColorClass)}>
                          {item.product_title || order.product_name || "Item"}
                        </h4>
                        {item.variant && <p className={cn("text-[11px] opacity-65", styles.textMutedClass)}>Option: {item.variant}</p>}
                        <p className={cn("text-[11px] opacity-65", styles.textMutedClass)}>Qty: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn("font-bold text-xs", styles.priceClass)}>
                          ₹{item.price || order.total_amount}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 opacity-60" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className={cn("font-semibold text-xs truncate", styles.textColorClass)}>
                        {order.product_name || "Store Item Purchase"}
                      </h4>
                      <p className={cn("text-[11px] opacity-65", styles.textMutedClass)}>Qty: 1</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn("font-bold text-xs", styles.priceClass)}>
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className={cn("pt-3 border-t space-y-2 text-xs", styles.dividerClass)}>
                <div className="flex justify-between">
                  <span className={cn("opacity-70", styles.textMutedClass)}>Subtotal</span>
                  <span className={cn("font-semibold", styles.textColorClass)}>₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className={cn("opacity-70", styles.textMutedClass)}>Taxes & Delivery</span>
                  <span className="text-emerald-400 font-semibold">Included</span>
                </div>
                <div className={cn("flex justify-between pt-2 border-t font-bold text-sm", styles.dividerClass)}>
                  <span className={styles.textColorClass}>Grand Total Paid</span>
                  <span className={styles.priceClass}>₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            {(order.customer_name || order.customer_email || order.shipping_address) && (
              <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-3.5", styles.cardClass)}>
                <h3 className={cn("text-xs font-semibold uppercase tracking-wider border-b pb-3 opacity-85", styles.textColorClass, styles.dividerClass)}>
                  Buyer Details
                </h3>
                <div className="space-y-2.5 text-xs">
                  {order.customer_name && (
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 opacity-60 shrink-0" />
                      <span className={cn("font-semibold truncate", styles.textColorClass)}>{order.customer_name}</span>
                    </div>
                  )}
                  {order.customer_email && (
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 opacity-60 shrink-0" />
                      <span className={cn("font-medium truncate opacity-85", styles.textMutedClass)}>{order.customer_email}</span>
                    </div>
                  )}
                  {order.shipping_address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 opacity-60 shrink-0 mt-0.5" />
                      <span className={cn("font-medium leading-relaxed opacity-85", styles.textMutedClass)}>
                        {order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ""}{order.shipping_pincode ? ` - ${order.shipping_pincode}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Card */}
            {(() => {
              const targetIgHandle = (supplier?.username || storeSettings?.instagram_account?.username || cleanUsername).replace(/^@/, "");
              return (
                <div className={cn("p-5 sm:p-6 rounded-md border shadow-xs space-y-3", styles.cardClass)}>
                  <h3 className={cn("text-xs font-semibold uppercase tracking-wider opacity-85 flex items-center gap-2", styles.textColorClass)}>
                    <HelpCircle className="w-4 h-4 opacity-70" />
                    Need Order Assistance?
                  </h3>
                  <p className={cn("text-xs opacity-75 leading-relaxed", styles.textMutedClass)}>
                    Have questions regarding your order or delivery? Contact store support directly on Instagram.
                  </p>
                  <a
                    href={`https://instagram.com/${targetIgHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-full py-2.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 border hover:opacity-85 transition-all cursor-pointer shadow-xs",
                      styles.buttonClass
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact @{targetIgHandle}</span>
                  </a>
                </div>
              );
            })()}

          </div>

        </div>
      </main>
    </div>
  );
}
