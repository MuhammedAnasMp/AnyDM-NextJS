"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  User,
  ShieldCheck,
  Truck,
  Zap,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  ExternalLink,
  HelpCircle,
  FileText,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";
import {
  getStoreHomeUrl,
  getOrdersUrl,
  getAccountUrl,
  getTermsUrl,
  getPrivacyUrl,
} from "@/lib/utils/domain";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 2.159.685 4.158 1.854 5.792L2.5 21.5l3.824-1.32C7.902 21.319 9.873 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.848 0-3.555-.54-4.993-1.468l-.358-.23-2.585.892.906-2.502-.249-.379A7.946 7.946 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
  </svg>
);

export interface StoreFooterProps {
  username: string;
  storeSettings?: any;
  supplier?: any;
  styles: TemplateStyle;
}

export default function StoreFooter({
  username,
  storeSettings,
  supplier,
  styles,
}: StoreFooterProps) {
  const cleanUsername = (username || "").replace(/^@/, "");
  const storeName = storeSettings?.store_name || supplier?.full_name || cleanUsername;
  const storeDesc = storeSettings?.store_description || "Official Web Store & Customer Order Portal";

  const rawIgHandle =
    supplier?.instagram_username ||
    storeSettings?.instagram_account?.username ||
    storeSettings?.instagram_username ||
    supplier?.username ||
    (cleanUsername.includes(".") ? "" : cleanUsername);
  const targetIgHandle = rawIgHandle.replace(/^@/, "");
  const storeOwnerDmUrl = targetIgHandle ? `https://ig.me/m/${targetIgHandle}` : `https://instagram.com`;

  return (
    <footer className={cn("border-t mt-10 sm:mt-20 transition-colors duration-300 w-full shrink-0", styles.dividerClass)}>

      {/* ── Top Trust Badges Bar ───────────────────────────────── */}
      {/* <div className={cn("border-b py-5", styles.dividerClass)}>
        <div className={cn("mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center", styles.containerClass)}>
          <div className="flex items-center justify-center gap-2.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left leading-tight">
              <p className={cn("text-xs font-semibold", styles.textColorClass)}>100% Secure Checkout</p>
              <p className={cn("text-[10px] opacity-60", styles.textMutedClass)}>Razorpay Encrypted</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left leading-tight">
              <p className={cn("text-xs font-semibold", styles.textColorClass)}>Instant Deliverables</p>
              <p className={cn("text-[10px] opacity-60", styles.textMutedClass)}>Digital Downloads Unlocked</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <Truck className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="text-left leading-tight">
              <p className={cn("text-xs font-semibold", styles.textColorClass)}>Express Shipping</p>
              <p className={cn("text-[10px] opacity-60", styles.textMutedClass)}>Tracked Courier Fulfillment</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <MessageCircle className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="text-left leading-tight">
              <p className={cn("text-xs font-semibold", styles.textColorClass)}>Direct Seller Support</p>
              <p className={cn("text-[10px] opacity-60", styles.textMutedClass)}>Instagram DM Assistance</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* ── Main Footer Grid ────────────────────────────────────── */}
      <div className={cn("py-8 sm:py-12 mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10", styles.containerClass)}>

        {/* Brand & Store Bio (4 Columns) */}
        <div className="lg:col-span-4 space-y-3.5">
          <Link href={getStoreHomeUrl(cleanUsername)} className="flex items-center gap-2.5 group">
            <div className={cn("w-8 h-8 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", styles.logoWrapperClass)}>
              {storeSettings?.store_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeSettings.store_logo} alt={storeName} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>
            <span className={cn("text-sm font-bold tracking-tight truncate", styles.textColorClass)}>
              {storeName}
            </span>
          </Link>
          <p className={cn("text-xs leading-relaxed max-w-sm font-normal opacity-80", styles.textMutedClass)}>
            {storeDesc}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <a
              href={storeOwnerDmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border hover:opacity-85 shadow-2xs cursor-pointer", styles.buttonClass)}
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Contact on Instagram</span>
            </a>
            {storeSettings?.contact_phone && (
              <a
                href={`https://wa.me/${storeSettings.contact_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer")}
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Customer Portal (3 Columns) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className={cn("text-xs font-bold tracking-wider uppercase opacity-90", styles.textColorClass)}>
            Customer Hub
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={getStoreHomeUrl(cleanUsername)} className={cn("hover:underline transition-opacity opacity-75 hover:opacity-100 flex items-center gap-1.5", styles.textMutedClass)}>
                <ShoppingBag className="w-3.5 h-3.5 opacity-60" />
                <span>Store Catalog</span>
              </Link>
            </li>
            <li>
              <Link href={getOrdersUrl(cleanUsername)} className={cn("hover:underline transition-opacity opacity-75 hover:opacity-100 flex items-center gap-1.5", styles.textMutedClass)}>
                <Package className="w-3.5 h-3.5 opacity-60" />
                <span>Lookup Order &amp; Downloads</span>
              </Link>
            </li>
            <li>
              <Link href={getAccountUrl(cleanUsername)} className={cn("hover:underline transition-opacity opacity-75 hover:opacity-100 flex items-center gap-1.5", styles.textMutedClass)}>
                <User className="w-3.5 h-3.5 opacity-60" />
                <span>My Customer Dashboard</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies & Legal (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className={cn("text-xs font-bold tracking-wider uppercase opacity-90", styles.textColorClass)}>
            Policies
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={getPrivacyUrl(cleanUsername)} className={cn("hover:underline transition-opacity opacity-75 hover:opacity-100 flex items-center gap-1.5", styles.textMutedClass)}>
                <ShieldCheck className="w-3.5 h-3.5 opacity-60" />
                <span>Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href={getTermsUrl(cleanUsername)} className={cn("hover:underline transition-opacity opacity-75 hover:opacity-100 flex items-center gap-1.5", styles.textMutedClass)}>
                <FileText className="w-3.5 h-3.5 opacity-60" />
                <span>Terms of Service</span>
              </Link>
            </li>
            <li>
              <span className={cn("opacity-60 flex items-center gap-1.5 cursor-default", styles.textMutedClass)}>
                <RefreshCw className="w-3.5 h-3.5 opacity-60" />
                <span>{storeSettings?.return_policy ? "Returns Accepted" : "Final Sale Policy"}</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Info & Support (3 Columns) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className={cn("text-xs font-bold tracking-wider uppercase opacity-90", styles.textColorClass)}>
            Store Contact
          </h4>
          <div className="space-y-2 text-xs">
            {storeSettings?.contact_email && (
              <div className={cn("flex items-center gap-2", styles.textMutedClass)}>
                <Mail className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <a href={`mailto:${storeSettings.contact_email}`} className="hover:underline truncate opacity-80 hover:opacity-100">
                  {storeSettings.contact_email}
                </a>
              </div>
            )}
            {storeSettings?.contact_phone && (
              <div className={cn("flex items-center gap-2", styles.textMutedClass)}>
                <Phone className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <a href={`tel:${storeSettings.contact_phone}`} className="hover:underline opacity-80 hover:opacity-100">
                  {storeSettings.contact_phone}
                </a>
              </div>
            )}
            {storeSettings?.shipping_address && (
              <div className={cn("flex items-start gap-2", styles.textMutedClass)}>
                <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0 mt-0.5" />
                <span className="leading-relaxed opacity-80">{storeSettings.shipping_address}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Bar: Copyright & Payment Icons ──────────────── */}
      <div className={cn("border-t py-6 transition-colors duration-300 text-center", styles.dividerClass)}>
        <div className={cn("mx-auto max-w-7xl px-4 flex flex-col items-center justify-center gap-2.5 text-xs", styles.containerClass)}>
          <p className={cn("font-bold text-sm sm:text-base tracking-tight opacity-90", styles.textColorClass)}>
            Thank you for shopping with {storeName}!
          </p>

          <p className={cn("opacity-75 text-center flex flex-wrap items-center justify-center gap-2 text-xs", styles.textMutedClass)}>
            <span>© {new Date().getFullYear()} <span className={cn("font-bold opacity-100", styles.textColorClass)}>{storeName}</span></span>
            <span>&bull;</span>
            <span>Powered by <a href="https://zoyee.in" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline" style={{ color: styles.accentColor }}>AnyDM</a></span>
          </p>

          <div className="flex flex-wrap justify-center items-center gap-1.5 opacity-70 text-[10px] font-mono uppercase tracking-wider pt-0.5">
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">UPI</span>
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">CARDS</span>
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">ONLINE</span>
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">COD</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
