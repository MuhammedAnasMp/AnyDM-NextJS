"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resolveCustomerSession, CustomerSessionData } from "@/lib/services/customerSession";
import { User, ShieldCheck, ChevronRight } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { TemplateStyle } from "@/components/templates/TemplateProvider";
import { cn } from "@/lib/utils";

import { getAccountUrl } from "@/lib/utils/domain";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface CustomerAccountBadgeProps {
  className?: string;
  styles?: TemplateStyle;
  username?: string;
  onClick?: () => void;
  variant?: "pill" | "flat";
}

export default function CustomerAccountBadge({ className = "", styles, username, onClick, variant = "pill" }: CustomerAccountBadgeProps) {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    resolveCustomerSession(username).then((res) => {
      if (res) {
        setSession(res);
      }
      setIsLoading(false);
    });
  }, [username]);

  const isInstagram = !!session?.instagram_username;
  let displayName = session?.instagram_username
    ? `@${session.instagram_username}`
    : session?.saved_address?.customer_name;

  if (!displayName && typeof window !== "undefined") {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("anydm_customer_orders") || "[]");
      const cleanUser = (username || "").replace(/^@/, "").toLowerCase().trim();
      const lastOrder = storedOrders.slice().reverse().find((o: any) =>
        (!cleanUser || !o.username || o.username.toLowerCase() === cleanUser) && (o.name || o.email)
      );
      if (lastOrder) {
        displayName = lastOrder.name || lastOrder.email?.split("@")[0];
      }
    } catch (e) {}
  }

  if (!displayName) {
    displayName = "Guest Customer";
  }

  const targetUsername = username || session?.instagram_username || "";

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
    const url = getAccountUrl(targetUsername);
    router.push(url);
  };

  const isLight = styles ? !styles.isDark : false;

  // Flat Variant (Clean borderless header matching store details layout without outer oval box shape)
  if (variant === "flat") {
    return (
      <button
        type="button"
        onClick={handleAccountClick}
        title={`Account: ${displayName} - View Account & Orders`}
        className={cn(
          "flex items-center gap-3 text-left transition-opacity hover:opacity-85 cursor-pointer min-w-0 group",
          className
        )}
      >
        <div className="relative shrink-0">
          <UserAvatar
            src={session?.instagram_profile_pic}
            name={displayName}
            className="w-9.5 h-9.5 rounded-lg text-sm font-bold border border-current/20 shadow-2xs"
            iconClassName="w-4.5 h-4.5"
          />
          {isInstagram && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-0.5 rounded-full text-white shadow-2xs">
              <InstagramIcon className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left leading-tight min-w-0 flex-1">
          <span className={cn("font-bold text-sm truncate group-hover:underline decoration-1 underline-offset-2", styles ? styles.textColorClass : "text-white")}>
            {displayName}
          </span>
          <span className={cn("text-[10.5px] font-medium opacity-65 truncate mt-0.5", styles ? styles.textMutedClass : "text-zinc-400")}>
            My Account & Orders
          </span>
        </div>
      </button>
    );
  }

  if (isLoading || !session) return null;

  return (
    <button
      type="button"
      onClick={handleAccountClick}
      title={`Logged in as ${displayName} - View Account & Orders`}
      className={cn(
        "relative flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full transition-all text-xs border shadow-sm group cursor-pointer active:scale-95",
        styles
          ? cn(
            isLight ? "bg-white/90 border-black/15 text-black hover:bg-white" : "bg-[#1c1b1b]/90 border-[#444748]/70 text-white hover:bg-[#1c1b1b]"
          )
          : "bg-[#1c1b1b] border-[#444748] text-white hover:border-white/40",
        className
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          src={session.instagram_profile_pic}
          name={displayName}
          className="w-6 h-6 rounded-full text-[10px]"
          iconClassName="w-3.5 h-3.5"
        />
      </div>

      <div className="flex flex-col text-left leading-tight min-w-0">
        <span className="font-extrabold max-w-[100px] truncate text-[11px]">
          {displayName}
        </span>
      </div>

      <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

