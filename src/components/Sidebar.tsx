"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import api from "@/lib/services/api.service";
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
  Menu,
  Plus,
  RefreshCw,
  Eye,
  QrCode,
} from "lucide-react";
import { UserAvatar, getUserDisplayName, getAvatarRingClass } from "@/components/Avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isVisibleOnScroll, setIsVisibleOnScroll] = useState(true);
  const [enableAi, setEnableAi] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAiEnabled = async () => {
      try {
        const sysRes = await api.get("/accounts/settings/system/");
        if (sysRes.data && sysRes.data.enable_ai !== undefined) {
          setEnableAi(sysRes.data.enable_ai);
        }
      } catch (err) {
        console.error("Error loading system settings in Sidebar:", err);
      }
    };
    checkAiEnabled();
  }, []);

  // Scroll direction listener (scroll down -> hide, scroll up -> show)
  useEffect(() => {
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsVisibleOnScroll(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 20) {
        setIsVisibleOnScroll(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // MutationObserver: hide nav when any modal/dialog is open
  useEffect(() => {
    const checkModals = () => {
      const hasModal = document.querySelector(
        '[role="dialog"], [aria-modal="true"], [data-modal="true"]'
      ) !== null;
      setIsModalActive(hasModal);
    };

    checkModals();

    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["role", "aria-modal", "data-modal"] });
    return () => observer.disconnect();
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
    { name: "Products", icon: Package, href: "/dashboard/products/catalog" },
    { name: "Inbox", icon: MessageSquare, href: "/dashboard/inbox/chats" },
    { name: "Refer & Earn", icon: Gift, href: "/dashboard/refer" },
    ...(appUser?.is_creator_vip ? [{ name: "Creator Hub", icon: DollarSign, href: "/dashboard/creator" }] : []),
    { name: "Pricing", icon: CreditCard, href: "/dashboard/pricing" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings/accounts" },
    ...(isAdmin ? [{ name: "Admin Panel", icon: ShieldAlert, href: "/dashboard/admin" }] : []),
  ];

  const mobileNavPillItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Link-in-Bio", icon: Link2, href: "/dashboard/bio/styling" },
    { name: "Automations", icon: Zap, href: "/dashboard/automation" },
    { name: "Schedule Posts", icon: CalendarClock, href: "/dashboard/schedule" },
    { name: "Products", icon: Package, href: "/dashboard/products/catalog" },
    { name: "Inbox", icon: MessageSquare, href: "/dashboard/inbox/chats" },
  ];

  const getSubNavItems = () => {
    if (activeTab === "Link-in-Bio") {
      return [
        { name: "Styling", href: "/dashboard/bio/styling" },
        { name: "Analytics", href: "/dashboard/bio/analytics" },
      ];
    }
    if (activeTab === "Dashboard") {
      return [
        { name: "Overview", href: "/dashboard" },
        { name: "Analytics", href: "/dashboard/analytics" },
        { name: "Revenue", href: "/dashboard/revenue" },
      ];
    }
    if (activeTab === "Products") {
      return [
        { name: "Products", href: "/dashboard/products/catalog" },
        { name: "Orders", href: "/dashboard/products/orders" },
        { name: "Website", href: "/dashboard/products/website" },
      ];
    }
    if (activeTab === "Automations") {
      return [
        { name: "Automations", href: "/dashboard/automation" },
        { name: "Builder", href: "/dashboard/automations" },
      ];
    }
    if (activeTab === "Inbox") {
      return [
        { name: "Chats", href: "/dashboard/inbox/chats" },
        { name: "Contacts", href: "/dashboard/inbox/contacts" },
      ];
    }
    if (activeTab === "Settings") {
      return [
        { name: "Accounts", href: "/dashboard/settings/accounts" },
        { name: "Seller KYC", href: "/dashboard/settings/kyc" },
        ...(enableAi ? [{ name: "AI Settings", href: "/dashboard/settings/ai" }] : []),
      ];
    }
    if (activeTab === "Admin Panel") {
      return [
        { name: "System", href: "/dashboard/admin" },
        { name: "Users", href: "/dashboard/admin/users" },
        { name: "Verify KYC", href: "/dashboard/admin/verify-kyc" },
        { name: "Orders", href: "/dashboard/admin/order-settings" },
        { name: "Settlements", href: "/dashboard/admin/payment-settlement" },
      ];
    }
    return [];
  };

  const currentSubNavItems = getSubNavItems();

  const isSubItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/automation") return pathname === "/dashboard/automation" || pathname.startsWith("/dashboard/automation?");
    return pathname === href || pathname.startsWith(href);
  };

  interface MobileCtaItem {
    label: string;
    href?: string;
    event?: string;
    icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    isInstagram?: boolean;
  }

  // CTA chips shown at end of sub-nav mini pill for action-oriented pages
  const getMobileCtas = (): MobileCtaItem[] => {
    if (activeTab === "Automations") return [{ label: "+ New", href: "/dashboard/automations", icon: Plus }];
    if (activeTab === "Schedule Posts") return [{ label: "+ Post", event: "open-schedule-create", icon: Plus }];
    if (activeTab === "Products" && pathname === "/dashboard/products/catalog") return [{ label: "+ Product", event: "open-create-product-type", icon: Plus }];
    if (activeTab === "Settings" && pathname === "/dashboard/settings/accounts") return [{ label: "+ Account", event: "trigger-add-instagram", isInstagram: true, icon: Plus }];
    if (activeTab === "Link-in-Bio" && !pathname.includes("/analytics")) {
      return [
        { label: "QR Code", event: "open-bio-qr-modal", icon: QrCode },
        { label: "Preview", event: "open-bio-preview-modal", icon: Eye },
      ];
    }
    return [];
  };

  const mobileCtas = getMobileCtas();

  const userDisplayName = getUserDisplayName(appUser);
  const googlePhoto = firebaseUser?.providerData?.find((p: { providerId: string; photoURL?: string | null }) => p.providerId === "google.com")?.photoURL || firebaseUser?.photoURL;
  const userPhoto = appUser?.photo_url || appUser?.profile_picture_url || googlePhoto || null;

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

  const [isMobileChatActive, setIsMobileChatActive] = useState(false);

  useEffect(() => {
    const handleChatActive = (e: CustomEvent) => {
      setIsMobileChatActive(!!e.detail?.isActive);
    };
    window.addEventListener("mobile-chat-active", handleChatActive as EventListener);
    return () => {
      window.removeEventListener("mobile-chat-active", handleChatActive as EventListener);
    };
  }, []);

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
            {/* Dynamic Profile Ring Outer Container */}
            <div className={cn("w-8 h-8 rounded-full shrink-0 flex items-center justify-center", getAvatarRingClass(appUser))}>
              {/* Inner dark separator boundary */}
              <div className="w-full h-full rounded-full overflow-hidden border border-[#131313] bg-[#20201f]">
                <UserAvatar
                  src={userPhoto}
                  alt={userDisplayName}
                  className="w-full h-full object-cover rounded-full"
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

      {/* Floating Glass Navigation System (Mobile View) */}
      <div
        className={cn(
          "fixed bottom-2.5 left-0 right-0 z-40 px-3.5 lg:hidden pointer-events-none transition-all duration-300 ease-in-out flex flex-col items-center gap-2",
          (!isVisibleOnScroll || isModalActive || isOpen || isMobileChatActive || pathname.startsWith("/dashboard/automations") || pathname === "/dashboard/products/catalog/create") ? "translate-y-28 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Tier-2 Sub-Nav Mini Glass Pill */}
        {(currentSubNavItems.length > 0 || mobileCtas.length > 0) && (
          <div className="pointer-events-auto max-w-[335px] w-full flex items-center justify-center">
            <div className="h-[34px] rounded-full px-1.5 bg-[#141414]/90 backdrop-blur-[24px] backdrop-saturate-[180%] border border-white/[0.14] shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-1 overflow-x-auto max-w-full scrollbar-hide">
              {currentSubNavItems.map((sub) => {
                const isActive = isSubItemActive(sub.href);
                return (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    onClick={(e) => {
                      handleLinkClick();
                      if (isActive) {
                        if (sub.href === "/dashboard") {
                          window.dispatchEvent(new CustomEvent("refresh-dashboard-overview"));
                        } else if (sub.href === "/dashboard/analytics") {
                          window.dispatchEvent(new CustomEvent("refresh-dashboard-analytics"));
                        } else if (sub.href === "/dashboard/revenue") {
                          window.dispatchEvent(new CustomEvent("refresh-dashboard-revenue"));
                        } else if (sub.href.startsWith("/dashboard/automation")) {
                          window.dispatchEvent(new CustomEvent("refresh-automations"));
                        } else if (sub.href.startsWith("/dashboard/products/catalog")) {
                          window.dispatchEvent(new CustomEvent("refresh-catalog"));
                        } else if (sub.href.startsWith("/dashboard/products/orders")) {
                          window.dispatchEvent(new CustomEvent("refresh-orders"));
                        } else if (sub.href.startsWith("/dashboard/schedule")) {
                          window.dispatchEvent(new CustomEvent("refresh-schedule"));
                        } else if (sub.href.startsWith("/dashboard/inbox/chats") || sub.href === "/dashboard/inbox") {
                          window.dispatchEvent(new CustomEvent("refresh-chats"));
                          window.dispatchEvent(new CustomEvent("refresh-inbox"));
                        } else if (sub.href === "/dashboard/inbox/contacts") {
                          window.dispatchEvent(new CustomEvent("refresh-contacts"));
                        } else {
                          window.dispatchEvent(new CustomEvent("refresh-active-page"));
                        }
                      }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 select-none active:scale-95 cursor-pointer",
                      isActive
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {sub.name}
                  </Link>
                );
              })}

              {/* Primary CTA chips */}
              {mobileCtas.length > 0 && (
                <>
                  {/* Only show divider if there are also sub-items */}
                  {currentSubNavItems.length > 0 && (
                    <div className="w-px h-4 bg-white/15 mx-0.5 shrink-0" />
                  )}
                  {mobileCtas.map((cta, idx) => {
                    const Icon = cta.icon || Plus;
                    return cta.href ? (
                      <Link
                        key={idx}
                        href={cta.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 select-none active:scale-95 flex items-center gap-1 shrink-0",
                          cta.isInstagram
                            ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold shadow-md border-none"
                            : "bg-white/15 text-white border border-white/25 hover:bg-white/25"
                        )}
                      >
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        <span>{cta.label.replace("+ ", "")}</span>
                      </Link>
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          if (cta.event) window.dispatchEvent(new CustomEvent(cta.event));
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 select-none active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer",
                          cta.isInstagram
                            ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold shadow-md border-none"
                            : "bg-white/15 text-white border border-white/25 hover:bg-white/25"
                        )}
                      >
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        <span>{cta.label.replace("+ ", "")}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tier-1 Main Bottom Navigation Bar */}
        <div className="w-full max-w-[335px] flex items-center justify-end gap-2 pointer-events-auto">
          {/* Glass Navigation Pill */}
          <nav className="flex-1 h-[48px] rounded-full bg-white/[0.08] backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(255,255,255,0.03)] flex items-center justify-around gap-0.5">
            {mobileNavPillItems.map((item) => {
              const isActive = activeTab === item.name;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-[0.84]",
                    isActive
                      ? "bg-white/15 text-white border border-white/20 shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                  title={item.name}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                </Link>
              );
            })}


          </nav>

          {/* Floating Circle Button (Menu / Drawer Toggle) */}
          <button
            type="button"
            onClick={() => {
              if (isOpen) {
                onClose();
              } else {
                window.dispatchEvent(new CustomEvent("open-sidebar"));
              }
            }}
            className="shrink-0 w-[46px] h-[46px] rounded-full bg-white/[0.095] backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/[0.16] shadow-[0_12px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16)] flex items-center justify-center text-white transition-all duration-200 active:scale-[0.84] hover:bg-white/20"
            title={isOpen ? "Close Menu" : "All Navigation Options"}
          >
            {isOpen ? (
              <X className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            ) : (
              <Menu className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}