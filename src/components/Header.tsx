"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import api from "@/lib/services/api.service";
import { RootState } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { auth } from "@/lib/firebase";
import Toast from "./Toast";
import { UserAvatar } from "./Avatar";
import InstagramIcon from "./ui/InstagramIcon";
import InstagramAccountGuard from "./InstagramAccountGuard";

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

  const [enableAi, setEnableAi] = useState(true);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ isVisible: false, message: "", type: "error" });

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
        console.error("Error loading system settings in Header:", err);
      }
    };
    checkAiEnabled();
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

  const handleReLoginInstagram = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const clientId = "1454663269228644";
    const redirectUri = `${window.location.origin}/dashboard/settings/accounts`;
    const scope =
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";
    window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&enable_fb_login=false`;
  };

  const handleSwitchAccount = async (accountId: number) => {
    const targetAccount = instagramAccounts.find((acc: any) => acc.id === accountId);
    if (targetAccount?.is_token_expired) {
      handleReLoginInstagram();
      return;
    }
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
    if (pathname.startsWith("/dashboard/schedule") || pathname.startsWith("/dashboard/publisher")) return "Schedule";
    if (pathname.startsWith("/dashboard/refer")) return "Refer";
    if (pathname.startsWith("/dashboard/pricing")) return "Pricing";
    if (pathname.startsWith("/dashboard/admin")) return "Admin";
    if (pathname.startsWith("/dashboard/bio")) return "Bio";
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
      { name: "All Automation", href: "/dashboard/automation" },
      { name: "Visual Builder", href: "/dashboard/automations" }
    ];

  // Mapping of category to its corresponding sub-navigation items
  const subNavItems: Record<string, Array<{ name: string; href: string }>> = {
    Dashboard: [
      { name: "Overview", href: "/dashboard" },
      { name: "Analytics", href: "/dashboard/analytics" },
      { name: "Revenue Growth", href: "/dashboard/revenue" },
    ],
    Products: [
      { name: "Products", href: "/dashboard/products/catalog" },
      { name: "Orders", href: "/dashboard/products/orders" },
      { name: "Website", href: "/dashboard/products/website" },
    ],
    Automations: automationsSubNav,
    Inbox: [
      { name: "Inbox", href: "/dashboard/inbox" },
      { name: "Contacts", href: "/dashboard/inbox/contacts" },
    ],
    Games: [
      { name: "Spin-to-Win", href: "/dashboard/games/spin" },
      { name: "Mystery Box", href: "/dashboard/games/mystery-box" },
      { name: "Engagement", href: "/dashboard/games/engagement" },
    ],
    Settings: [
      { name: "Manage Accounts", href: "/dashboard/settings/accounts" },
      { name: "Seller KYC", href: "/dashboard/settings/kyc" },
      ...(enableAi ? [{ name: "AI Settings", href: "/dashboard/settings/ai" }] : []),
    ],
    Admin: [
      { name: "System Settings", href: "/dashboard/admin" },
      { name: "User Analytics", href: "/dashboard/admin/users" },
      { name: "Verify KYC", href: "/dashboard/admin/verify-kyc" },
      { name: "Order Settings", href: "/dashboard/admin/order-settings" },
      { name: "Payment Settlements", href: "/dashboard/admin/payment-settlement" },
    ],
    Bio: [],
    Schedule: [],
    Refer: [],
    Pricing: [],
  };

  const items = subNavItems[category] || [];

  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === appUser?.active_instagram_account_id
  ) || instagramAccounts[0];

  useEffect(() => {
    if (activeAccount?.is_token_expired) {
      setToast({
        isVisible: true,
        message: `The Instagram session for @${activeAccount.username} has expired. Please re-login first.`,
        type: "error"
      });
      if (pathname !== "/dashboard/settings/accounts") {
        router.push("/dashboard/settings/accounts");
      }
    }
  }, [activeAccount?.id, activeAccount?.is_token_expired, pathname, router]);

  const userDisplayName = appUser?.display_name || appUser?.first_name || "User";
  const googlePhoto = firebaseUser?.providerData?.find((p: any) => p.providerId === "google.com")?.photoURL || firebaseUser?.photoURL;
  const userPhoto = googlePhoto || appUser?.photo_url || "https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg";

  return (
    <div className="sticky top-0 z-[50] w-full flex flex-col bg-[#131313] border-b border-white/5 shrink-0 text-white">
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
            <div
              className={`relative ${
                pathname === "/dashboard/products/catalog/create" ||
                pathname.startsWith("/dashboard/automations") ||
                pathname.startsWith("/dashboard/bio")
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : ""
                }`}
              ref={accountMenuRef}
            >
              <div
                onClick={() =>
                  (instagramAccounts.length > 1 || activeAccount?.is_token_expired) &&
                  setIsAccountMenuOpen(!isAccountMenuOpen)
                }
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  activeAccount?.is_token_expired ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-white/5"
                } backdrop-blur-md cursor-pointer hover:bg-white/10 transition-all mr-1 md:mr-2 select-none ${
                  instagramAccounts.length > 1 || activeAccount?.is_token_expired ? "active:scale-[0.98]" : ""
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-white/10 shrink-0 relative">
                  <UserAvatar
                    src={activeAccount?.profile_picture_url}
                    alt="Instagram Profile"
                    className="w-full h-full object-cover"
                    fallbackIcon={<span className="material-symbols-outlined text-[13px] text-white/70">person</span>}
                  />
                  {activeAccount?.is_token_expired && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-black" title="Session Expired" />
                  )}
                </div>

                <span className="text-[10px] md:text-xs font-bold text-white hidden sm:inline">
                  @{activeAccount?.username || 'user'}
                </span>

                {activeAccount?.is_token_expired ? (
                  <span className="text-[9px] font-extrabold text-red-400 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded hidden sm:inline">
                    Expired
                  </span>
                ) : (
                  instagramAccounts.length > 1 && (
                    <span className="material-symbols-outlined text-sm text-[#c4c7c8]/60 hidden sm:inline">
                      expand_more
                    </span>
                  )
                )}
              </div>

              {isAccountMenuOpen && (instagramAccounts.length > 1 || activeAccount?.is_token_expired) && (
                <div className="absolute right-0 mt-2 w-64 bg-[#121212] border border-white/15 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <p className="text-[10px] font-bold text-[#c4c7c8]/60 px-3 py-1.5 tracking-wider uppercase mb-1">
                    {instagramAccounts.length > 1 ? "Switch Account" : "Account Status"}
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {instagramAccounts.map((acc: any) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          if (acc.is_token_expired) {
                            handleReLoginInstagram();
                          } else {
                            handleSwitchAccount(acc.id);
                          }
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          acc.id === activeAccount?.id
                            ? "bg-white/10 text-white font-semibold"
                            : "hover:bg-white/5 text-[#c4c7c8]/60 hover:text-white"
                        } ${acc.is_token_expired ? "border border-red-500/30 bg-red-500/10" : ""}`}
                      >
                        <UserAvatar
                          src={acc.profile_picture_url}
                          alt={acc.username}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                          fallbackIcon={<span className="material-symbols-outlined text-[13px] text-[#c4c7c8]">person</span>}
                        />

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs truncate">@{acc.username}</span>
                          {acc.is_token_expired && (
                            <span className="text-[9px] text-red-400 font-bold">Session Expired</span>
                          )}
                        </div>

                        {acc.is_token_expired ? (
                          <button
                            type="button"
                            onClick={(e) => handleReLoginInstagram(e)}
                            className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-md flex items-center gap-1 transition-all shrink-0 shadow"
                            title="Re-login to reconnect Instagram"
                          >
                            <span className="material-symbols-outlined text-[12px]">refresh</span>
                            <span>Re-login</span>
                          </button>
                        ) : (
                          acc.id === activeAccount?.id && (
                            <span className="material-symbols-outlined text-sm text-white ml-auto">
                              check
                            </span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="p-1.5 md:p-2 text-[#c4c7c8]/60 hover:text-white transition-colors hover:bg-white/5 rounded-full relative notification-pulse">
            <span className="material-symbols-outlined text-lg md:text-xl">notifications</span>
          </button>
          <Link
            href="/docs"
            title="User Documentation"
            className="p-1.5 md:p-2 text-[#c4c7c8]/60 hover:text-white transition-colors hover:bg-white/5 rounded-full hidden sm:inline-flex"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">help_outline</span>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-0.5 md:mx-1"></div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full shrink-0 p-[1.5px] bg-gradient-to-tr from-[#A67C00] via-[#BF9B30] via-[#FFBF00] via-[#FFCF40] to-[#FFDC73] flex items-center justify-center cursor-pointer hover:scale-105 transition-all active:scale-95 select-none"
            >
              <div className="w-full h-full rounded-full overflow-hidden border border-[#131313] bg-[#20201f]">
                <UserAvatar
                  src={userPhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  fallbackIcon={<span className="material-symbols-outlined text-[16px] text-white/70">person</span>}
                />
              </div>
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#121212] border border-white/15 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                  <p className="text-[10px] text-[#c4c7c8]/60 truncate mt-0.5">{appUser?.email || "Connected account"}</p>
                </div>

                <Link
                  href="/docs"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#c4c7c8]/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>Documentation</span>
                </Link>

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

      {/* Instagram Account Guard Banner — placed BEFORE Tier 2 Horizontal Sub-Nav */}
      <InstagramAccountGuard />

      {/* Tier 2: Sub-Navigation Bar */}
      {!pathname.startsWith("/dashboard/automations") && !pathname.includes("/products/catalog/create") && items.length > 0 && (
        <nav className="bg-[#181817]/40 backdrop-blur-xl border-t border-white/5 px-4 lg:px-lg h-9 flex items-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 md:gap-3 text-xs font-semibold h-full whitespace-nowrap">
            {items.map((item) => {
              const pathBase = item.href.split("?")[0];
              const isSubActive = pathname === pathBase &&
                (!item.href.includes("?") || searchParams.get("id") === new URL(item.href, "http://x").searchParams.get("id"));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`h-full flex items-center px-1 border-b-2 transition-all ${isSubActive
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
      )}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
