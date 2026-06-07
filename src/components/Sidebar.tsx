"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Zap, 
  Gamepad2, 
  Package, 
  MessageSquare, 
  Settings, 
  X,
  Video
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const appUser = useSelector((state: RootState) => state.auth.user);

  const getActiveTab = () => {
    if (pathname.startsWith("/dashboard/automations") || pathname.startsWith("/dashboard/automation")) return "Automations";
    if (pathname.startsWith("/dashboard/videos")) return "Videos";
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/revenue")) return "Dashboard";
    if (pathname.startsWith("/dashboard/products")) return "Products";
    if (pathname.startsWith("/dashboard/inbox")) return "Inbox";
    if (pathname.startsWith("/dashboard/games")) return "Games";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  const activeTab = getActiveTab();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Automations", icon: Zap, href: "/dashboard/automations" },
    { name: "Videos", icon: Video, href: "/dashboard/videos" },
    { name: "Games", icon: Gamepad2, href: "/dashboard/games/spin" },
    { name: "Products", icon: Package, href: "/dashboard/products/catalog" },
    { name: "Inbox", icon: MessageSquare, href: "/dashboard/inbox" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings/accounts" },
  ];

  const userDisplayName = appUser?.display_name || appUser?.first_name || "Alex Rivera";
  const userPhoto = appUser?.photo_url || "https://picsum.photos/seed/elena/100/100";
  const accountType = appUser?.plan === "pro" ? "Creator Pro" : "Basic Creator";

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel - AnyDm-2.0 Glassmorphic Sidebar Style */}
      <aside 
        className={cn(
          "fixed z-50 w-[240px] shrink-0 border-r border-white/10 bg-[#131313]/90 backdrop-blur-xl text-white flex flex-col p-6 transition-transform duration-300 ease-in-out",
          "top-0 bottom-0 left-0 h-screen lg:rounded-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 shrink-0 px-2 mb-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 bg-[#131313] rounded-full mix-blend-overlay opacity-50" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-white">AnyDM</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em]">Playground</span>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            const targetHref = item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={targetHref}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 h-12 rounded-xl cursor-pointer transition-all duration-200 relative group",
                  isActive 
                    ? "bg-white/10 text-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.02)] border border-white/5" 
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
                )}
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-105", 
                    isActive ? "text-white" : "text-on-surface-variant group-hover:text-white"
                  )} 
                />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
          <Link 
            href="/dashboard/settings/accounts"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt={userDisplayName} 
                className="w-full h-full object-cover" 
                src={userPhoto}
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{userDisplayName}</span>
              <span className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase truncate">{accountType}</span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

