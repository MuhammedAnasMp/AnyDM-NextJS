"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { auth } from "@/lib/firebase";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const createdAutomations = useSelector((state: RootState) => state.automation.createdAutomations);

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSwitchAccount = async (accountId: number) => {
    try {
      await authService.setActiveInstagramAccount(accountId);
      setIsAccountMenuOpen(false);
    } catch (err) {
      console.error("Failed to switch account:", err);
    }
  };

  // Mapping to determine which category we are in
  const getCategory = () => {
    if (pathname.startsWith("/dashboard/products")) return "Products";
    if (pathname.startsWith("/dashboard/automations") || pathname.startsWith("/dashboard/automation")) return "Automations";
    if (pathname.startsWith("/dashboard/inbox")) return "Inbox";
    if (pathname.startsWith("/dashboard/games")) return "Games";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    if (pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/revenue") || pathname === "/dashboard") return "Dashboard";
    return "Dashboard";
  };

  const category = getCategory();

  // Dynamic Automations Navigation items:
  const automationsSubNav = createdAutomations.length > 0
    ? [
        { name: "Visual Builder", href: "/dashboard/automations" },
        { name: createdAutomations[0].name, href: `/dashboard/automation?id=${createdAutomations[0].id}` },
        { name: "Browse Templates", href: "/dashboard/automation" }
      ]
    : [
        { name: "Visual Builder", href: "/dashboard/automations" },
        { name: "Create Automation", href: "/dashboard/automation" }
      ];

  // Mapping of category to its corresponding sub-navigation items
  const subNavItems: Record<string, Array<{ name: string; href: string }>> = {
    Dashboard: [
      { name: "Overview", href: "/dashboard" },
      { name: "Analytics", href: "/dashboard/analytics" },
      { name: "Revenue Growth", href: "/dashboard/revenue" },
    ],
    Products: [
      { name: "Catalog", href: "/dashboard/products/catalog" },
      { name: "Media Sync", href: "/dashboard/products/sync" },
      { name: "DM Replies", href: "/dashboard/products/replies" },
      { name: "Website", href: "/dashboard/products/website" },
    ],
    Automations: automationsSubNav,
    Inbox: [
      { name: "Inbox", href: "/dashboard/inbox" },
      { name: "Contacts", href: "/dashboard/inbox/contacts" },
      { name: "Broadcast", href: "/dashboard/inbox/broadcast" },
    ],
    Games: [
      { name: "Spin-to-Win", href: "/dashboard/games/spin" },
      { name: "Mystery Box", href: "/dashboard/games/mystery-box" },
      { name: "Engagement", href: "/dashboard/games/engagement" },
    ],
    Settings: [
      { name: "Manage Accounts", href: "/dashboard/settings/accounts" },
      { name: "Workspace Settings", href: "/dashboard/settings/workspace" },
      { name: "AI Settings", href: "/dashboard/settings/ai" },
    ],
  };

  const items = subNavItems[category] || [];

  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === appUser?.active_instagram_account_id
  ) || instagramAccounts[0];

  const userDisplayName = appUser?.display_name || appUser?.first_name || "User";
  const googlePhoto = firebaseUser?.providerData?.find((p: any) => p.providerId === "google.com")?.photoURL || firebaseUser?.photoURL;
  const userPhoto = googlePhoto || appUser?.photo_url || "https://picsum.photos/seed/elena/100/100";

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col bg-[#131313] border-b border-white/5 shrink-0 text-white">
      {/* Tier 1: Main Header */}
      <header className="px-4 lg:px-lg py-sm flex justify-between items-center w-full min-h-[64px] gap-4">
        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-[#c4c7c8]/60 hover:text-white shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Left-aligned Search Bar */}
          <div className="relative group flex-1 max-w-xs md:max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#c4c7c8]/40 group-focus-within:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <input 
              className="bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-white/20 w-full transition-all text-white placeholder:text-[#c4c7c8]/40 outline-none" 
              placeholder="Search anything (⌘K)" 
              type="text" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Instagram Account Switcher Dropdown */}
          {activeAccount && (
            <div className="relative" ref={accountMenuRef}>
              <div 
                onClick={() => instagramAccounts.length > 1 && setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-all mr-1 md:mr-2 select-none ${instagramAccounts.length > 1 ? "active:scale-[0.98]" : ""}`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
                  <img 
                    src={activeAccount.profile_picture_url || "https://picsum.photos/seed/elena/100/100"} 
                    alt="Instagram Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-white hidden sm:inline">@{activeAccount.username}</span>
                {instagramAccounts.length > 1 && (
                  <span className="material-symbols-outlined text-sm text-[#c4c7c8]/60 hidden sm:inline">expand_more</span>
                )}
              </div>

              {isAccountMenuOpen && instagramAccounts.length > 1 && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a19]/90 border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                  <p className="text-[10px] uppercase font-bold text-[#c4c7c8]/60 px-3 py-1.5 tracking-wider">Switch Account</p>
                  {instagramAccounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      onClick={() => handleSwitchAccount(acc.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${acc.id === activeAccount.id ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-[#c4c7c8]/60 hover:text-white"}`}
                    >
                      <img 
                        src={acc.profile_picture_url} 
                        className="w-5 h-5 rounded-full object-cover" 
                        alt={acc.username}
                      />
                      <span className="text-xs truncate">@{acc.username}</span>
                      {acc.id === activeAccount.id && (
                        <span className="material-symbols-outlined text-sm text-white ml-auto">check</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="p-1.5 md:p-2 text-[#c4c7c8]/60 hover:text-white transition-colors hover:bg-white/5 rounded-full relative notification-pulse">
            <span className="material-symbols-outlined text-lg md:text-xl">notifications</span>
          </button>
          <button className="p-1.5 md:p-2 text-[#c4c7c8]/60 hover:text-white transition-colors hover:bg-white/5 rounded-full hidden sm:inline-flex">
            <span className="material-symbols-outlined text-lg md:text-xl">help_outline</span>
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-0.5 md:mx-1"></div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-7 h-7 md:w-8 h-8 rounded-full border border-white/20 bg-white/5 overflow-hidden cursor-pointer hover:border-white transition-colors active:scale-95 select-none"
            >
              <img 
                alt="Profile" 
                className="w-full h-full object-cover" 
                src={userPhoto}
              />
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1a1a19]/90 border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-[#c4c7c8]/60 truncate mt-0.5">{appUser?.email || "Connected account"}</p>
                </div>

                <Link 
                  href="/dashboard/settings/accounts"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#c4c7c8]/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  <span>Settings</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tier 2: Sub-Navigation Bar */}
      <nav className="bg-[#181817]/40 backdrop-blur-xl border-t border-white/5 px-4 lg:px-lg h-12 flex items-center overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6 md:gap-8 text-xs font-semibold h-full whitespace-nowrap">
          {items.map((item) => {
            const pathBase = item.href.split("?")[0];
            const isSubActive = pathname === pathBase && 
              (!item.href.includes("?") || searchParams.get("id") === new URL(item.href, "http://x").searchParams.get("id"));
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`h-full flex items-center px-1 border-b-2 transition-all ${
                  isSubActive 
                    ? "text-white font-bold border-white" 
                    : "text-[#c4c7c8]/60 border-transparent hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
