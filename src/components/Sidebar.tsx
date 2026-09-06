"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import {
  LayoutDashboard,
  Zap,
  Package,
  MessageSquare,
  Settings,
  X,
  Gift,
  CreditCard,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  DollarSign,
  Link2,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const getActiveTab = () => {
    if (pathname.startsWith("/dashboard/bio") || pathname.startsWith("/dashboard/link-in-bio")) return "Link-in-Bio";
    if (pathname.startsWith("/dashboard/automations") || pathname.startsWith("/dashboard/automation")) return "Automations";
    if (pathname.startsWith("/dashboard/schedule") || pathname.startsWith("/dashboard/publisher")) return "Schedule Posts";
    if (pathname.startsWith("/dashboard/videos")) return "Videos";
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/revenue")) return "Dashboard";
    if (pathname.startsWith("/dashboard/products")) return "Products";
    if (pathname.startsWith("/dashboard/inbox")) return "Inbox";
    if (pathname.startsWith("/dashboard/games")) return "Games";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    if (pathname.startsWith("/dashboard/admin")) return "Admin Panel";
    if (pathname.startsWith("/dashboard/refer")) return "Refer & Earn";
    if (pathname.startsWith("/dashboard/creator")) return "Creator Hub";
    if (pathname.startsWith("/dashboard/pricing")) return "Pricing";
    return "Dashboard";
  };

  const activeTab = getActiveTab();

  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Link-in-Bio", icon: Link2, href: "/dashboard/bio" },
    { name: "Automations", icon: Zap, href: "/dashboard/automation" },
    { name: "Schedule Posts", icon: CalendarClock, href: "/dashboard/schedule" },
    // { name: "Videos", icon: Video, href: "/dashboard/videos" },
    // { name: "Games", icon: Gamepad2, href: "/dashboard/games/spin" },
    { name: "Products", icon: Package, href: "/dashboard/products/catalog" },
    { name: "Inbox", icon: MessageSquare, href: "/dashboard/inbox" },
    { name: "Refer & Earn", icon: Gift, href: "/dashboard/refer" },
    ...(appUser?.is_creator_vip ? [{ name: "Creator Hub", icon: DollarSign, href: "/dashboard/creator" }] : []),
    { name: "Pricing", icon: CreditCard, href: "/dashboard/pricing" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings/accounts" },
    ...(isAdmin ? [{ name: "Admin Panel", icon: ShieldAlert, href: "/dashboard/admin" }] : []),
  ];

  const userDisplayName = appUser?.display_name || appUser?.first_name || "Alex Rivera";
  const googlePhoto = firebaseUser?.providerData?.find((p: { providerId: string; photoURL?: string | null }) => p.providerId === "google.com")?.photoURL || firebaseUser?.photoURL;
  const userPhoto = googlePhoto || appUser?.photo_url || "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg";

  const getAccountTypeLabel = () => {
    const isPremiumActive = appUser?.is_premium_active ?? false;
    if (appUser?.plan === "pro") {
      return isPremiumActive ? "Creator Pro" : "Pro Expired";
    }
    const trialDaysLeft = appUser?.trial_days_left ?? 0;

    if (isPremiumActive) {
      if (appUser?.has_extended_trial) {
        return `Extended Trial (${trialDaysLeft}d left)`;
      }
      return `Free Trial (${trialDaysLeft}d left)`;
    } else {
      return "Trial Expired";
    }
  };

  const accountType = getAccountTypeLabel();

  const [isRailMode, setIsRailMode] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsRailMode(prev => !prev);
    };
    window.addEventListener('toggle-main-sidebar-rail', handleToggle);
    window.addEventListener('toggle-welcome-panel', handleToggle);
    return () => {
      window.removeEventListener('toggle-main-sidebar-rail', handleToggle);
      window.removeEventListener('toggle-welcome-panel', handleToggle);
    };
  }, []);

  const handleLinkClick = () => {
    if (isOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0e0e0e]/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Structural Sidebar Panel */}
      <aside
        className={cn(
          "fixed z-50 shrink-0 border-r border-[#20201f] bg-[#131313] text-[#e5e2e1] flex flex-col transition-all duration-300 ease-in-out select-none",
          "top-0 bottom-0 left-0 h-screen lg:rounded-none",
          isRailMode ? "w-16 p-2" : "w-60 p-3",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          "flex items-center h-14 shrink-0 px-2 mb-4 border-b border-[#20201f]",
          isRailMode ? "justify-center" : "justify-between"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5" title="AnyDM Dashboard">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/logo_white.png"
                alt="AnyDM Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            {!isRailMode && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-none text-[#e5e2e1] tracking-tight">AnyDM</span>
              </div>
            )}
          </Link>

          {!isRailMode && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-[#20201f] rounded text-[#c4c7c8] hover:text-[#e5e2e1] transition-colors"
            >
              <X className="w-4.5 h-4.5" size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            const targetHref = item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={targetHref}
                onClick={handleLinkClick}
                title={isRailMode ? item.name : undefined}
                className={cn(
                  "flex items-center h-9 rounded text-sm relative group select-none [-webkit-tap-highlight-color:transparent] active:scale-[0.99] transition-all duration-200",
                  isRailMode ? "justify-center px-0 w-11 h-11 mx-auto" : "gap-2.5 px-3",
                  isActive
                    ? "bg-[#20201f] text-[#ffffff] font-medium border border-[#353535]/60 shadow-sm"
                    : "text-[#c4c7c8] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] border border-transparent"
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 1.75 : 1.5}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-[#ffffff]" : "text-[#8e9192] group-hover:text-[#e5e2e1]"
                  )}
                />
                {!isRailMode && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="flex flex-col gap-2 border-t border-[#20201f] pt-3 mt-auto shrink-0">
          <Link
            href="/dashboard/settings/accounts"
            onClick={handleLinkClick}
            title={isRailMode ? userDisplayName : undefined}
            className={cn(
              "flex items-center rounded border border-transparent hover:bg-[#1c1b1b] cursor-pointer group select-none [-webkit-tap-highlight-color:transparent] transition-all duration-200",
              isRailMode ? "justify-center p-1" : "gap-2.5 px-2 py-2"
            )}
          >
            {/* Gold Gradient Ring Outer Container */}
            <div className="w-8 h-8 rounded-full shrink-0 p-[1.5px] bg-gradient-to-tr from-[#A67C00] via-[#BF9B30] via-[#FFBF00] via-[#FFCF40] to-[#FFDC73] flex items-center justify-center">
              {/* Inner dark separator boundary */}
              <div className="w-full h-full rounded-full overflow-hidden border border-[#131313] bg-[#20201f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={userDisplayName}
                  className="w-full h-full object-cover"
                  src={userPhoto}
                />
              </div>
            </div>

            {!isRailMode && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-[#e5e2e1] truncate group-hover:text-[#ffffff] transition-colors">
                  {userDisplayName}
                </span>
                <span className="text-[9px] text-[#8e9192] font-semibold tracking-wider truncate mt-0.5">
                  {accountType}
                </span>
              </div>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-main-sidebar-rail'))}
          className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1c1b1b] border border-[#20201f] hover:bg-[#2c2c2c] hover:border-zinc-500 text-zinc-400 hover:text-white items-center justify-center shadow-md cursor-pointer z-50 transition-all duration-200"
          title={isRailMode ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isRailMode ? <ChevronRight className="w-5 h-5 text-[#c4c0ff]" /> : <ChevronLeft className="w-5 h-5 text-zinc-400" />}
        </button>
      </aside>
    </>
  );
}