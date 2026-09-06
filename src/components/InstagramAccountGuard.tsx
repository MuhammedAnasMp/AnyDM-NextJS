"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { RootState } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { setInstagramAccounts } from "@/store/slices/authSlice";
import { UserAvatar } from "@/components/Avatar";
import InstagramIcon from "@/components/ui/InstagramIcon";
import {
  AlertTriangle,
  Plus,
  Play,
  RefreshCw,
  Loader2,
  ShieldAlert,
  User,
  CheckCircle2,
} from "lucide-react";

interface InstagramAccountGuardProps {
  children: React.ReactNode;
}

export default function InstagramAccountGuard({ children }: InstagramAccountGuardProps) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const isHydrating = useSelector((state: RootState) => state.auth.isHydrating);
  const isFetchingAccounts = useSelector((state: RootState) => state.auth.isFetchingAccounts);

  const hasIgCode = searchParams ? searchParams.get("code") : null;

  // Auto-select active account if user has enabled accounts but none active
  useEffect(() => {
    if (isHydrating || isFetchingAccounts || instagramAccounts.length === 0) return;

    const enabledAccounts = instagramAccounts.filter(
      (acc: any) => acc.is_enabled !== false && !acc.is_token_expired
    );

    if (enabledAccounts.length > 0) {
      const activeExists = enabledAccounts.some(
        (acc: any) => acc.id === appUser?.active_instagram_account_id
      );
      if (!activeExists) {
        // Automatically set the first enabled account as active
        authService.setActiveInstagramAccount(enabledAccounts[0].id).catch((err) => {
          console.error("Auto set active Instagram account failed:", err);
        });
      }
    }
  }, [instagramAccounts, appUser?.active_instagram_account_id, isHydrating, isFetchingAccounts]);

  const handleConnectInstagram = () => {
    const clientId = "1454663269228644";
    const redirectUri = `${window.location.origin}/dashboard/settings/accounts`;
    const scope =
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";
    window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&enable_fb_login=false`;
  };

  const handleActivateAccount = async (accountId: number) => {
    setActivatingId(accountId);
    try {
      await authService.toggleInstagramEnabled(accountId, true);
      await authService.setActiveInstagramAccount(accountId);
      const updatedAccounts = instagramAccounts.map((acc: any) =>
        acc.id === accountId ? { ...acc, is_enabled: true } : acc
      );
      dispatch(setInstagramAccounts(updatedAccounts));
    } catch (err) {
      console.error("Failed to activate Instagram account:", err);
    } finally {
      setActivatingId(null);
    }
  };

  // Wait while authenticating/hydrating or exchanging OAuth code
  if (isHydrating || isFetchingAccounts || hasIgCode) {
    return <>{children}</>;
  }

  // Check conditions
  const hasNoAccounts = instagramAccounts.length === 0;

  const enabledAccounts = instagramAccounts.filter(
    (acc: any) => acc.is_enabled !== false && !acc.is_token_expired
  );
  const hasNoActiveAccount = !hasNoAccounts && enabledAccounts.length === 0;

  const mustBlockDashboard = hasNoAccounts || hasNoActiveAccount;

  return (
    <div className="relative min-h-screen">
      {/* Dashboard children layer */}
      <div className={mustBlockDashboard ? "pointer-events-none select-none filter blur-sm opacity-40 overflow-hidden max-h-screen" : ""}>
        {children}
      </div>

      {/* Forced Non-Dismissible Overlay Modal */}
      {mustBlockDashboard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md rounded-xl bg-[#1c1b1b] border border-[#c4c0ff]/30 shadow-2xl p-6 sm:p-8 text-[#e5e2e1] space-y-6">
            
            {/* Header Accent / Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#131313] flex items-center justify-center">
                  <InstagramIcon className="w-7 h-7 text-white" />
                </div>
              </div>

              {hasNoAccounts ? (
                <>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Connect Instagram Account Required
                  </h2>
                  <p className="text-xs text-[#8e9192] leading-relaxed max-w-sm">
                    Welcome to AnyDM! To start automating DMs, scheduled posts, and lead generation, you must connect at least one Instagram account to your profile.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Active Instagram Account Required
                  </h2>
                  <p className="text-xs text-[#8e9192] leading-relaxed max-w-sm">
                    All of your connected Instagram accounts are currently inactive or paused. Please activate an account or connect a new one to continue using AnyDM.
                  </p>
                </>
              )}
            </div>

            {/* If user has 0 connected accounts */}
            {hasNoAccounts && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#101115] border border-[#2a2a2a] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#c4c0ff]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Setup Requirement</span>
                  </div>
                  <p className="text-[11px] text-[#8e9192] leading-normal">
                    Connecting your Instagram Professional or Creator account enables custom flow automations, keyword triggers, and live analytics.
                  </p>
                </div>

                <button
                  onClick={handleConnectInstagram}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Connect Instagram Account</span>
                </button>
              </div>
            )}

            {/* If user has accounts, but none are active */}
            {hasNoActiveAccount && (
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <span className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">
                    Your Connected Accounts
                  </span>
                  {instagramAccounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-lg bg-[#101115] border border-[#2a2a2a] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#2a2a2a] bg-[#20201f] shrink-0">
                          <UserAvatar
                            src={acc.profile_picture_url}
                            alt={acc.username}
                            className="w-full h-full object-cover"
                            fallbackIcon={<User className="w-4 h-4 text-[#8e9192]" />}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            @{acc.username}
                          </div>
                          <div className="text-[10px] text-amber-400 font-medium">
                            {acc.is_token_expired ? "Session Expired" : "Paused / Inactive"}
                          </div>
                        </div>
                      </div>

                      {acc.is_token_expired ? (
                        <button
                          onClick={handleConnectInstagram}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-login</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateAccount(acc.id)}
                          disabled={activatingId === acc.id}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#c4c0ff] hover:bg-[#b0acff] text-[#131313] flex items-center gap-1 cursor-pointer transition-all shrink-0 disabled:opacity-50"
                        >
                          {activatingId === acc.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#2a2a2a] flex flex-col items-center gap-2">
                  <button
                    onClick={handleConnectInstagram}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Connect New Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* Note / Info */}
            <div className="text-center text-[10px] text-[#8e9192]">
              Secure OAuth 2.0 connection powered by Meta Graph API.
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
