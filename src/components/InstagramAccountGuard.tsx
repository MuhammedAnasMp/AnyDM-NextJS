"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, usePathname } from "next/navigation";
import { RootState } from "@/store";
import { authService } from "@/lib/services/auth.service";
import { setInstagramAccounts } from "@/store/slices/authSlice";
import { UserAvatar } from "@/components/Avatar";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { cn } from "@/lib/utils";
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
  children?: React.ReactNode;
}

export default function InstagramAccountGuard({ children }: InstagramAccountGuardProps) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const isHydrating = useSelector((state: RootState) => state.auth.isHydrating);
  const isFetchingAccounts = useSelector((state: RootState) => state.auth.isFetchingAccounts);

  const hasIgCode = searchParams ? searchParams.get("code") : null;

  // Excluded paths where the warning banner is not needed (e.g. accounts settings where user connects account)
  const isExcludedPath =
    pathname?.startsWith("/dashboard/settings") ||
    pathname?.startsWith("/dashboard/pricing") ||
    pathname?.startsWith("/dashboard/refer") ||
    pathname?.startsWith("/dashboard/admin") ||
    pathname?.startsWith("/docs");

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

  // Check conditions
  const hasNoAccounts = instagramAccounts.length === 0;

  const enabledAccounts = instagramAccounts.filter(
    (acc: any) => acc.is_enabled !== false && !acc.is_token_expired
  );
  const hasNoActiveAccount = !hasNoAccounts && enabledAccounts.length === 0;

  const mustShowBanner = !isExcludedPath && !isHydrating && !isFetchingAccounts && !hasIgCode && (hasNoAccounts || hasNoActiveAccount);

  if (!mustShowBanner || bannerDismissed) {
    return children ? <>{children}</> : null;
  }

  const bannerJsx = (
    <div className="instagram-glow border-b border-white/10 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0 z-20 text-white shadow-lg">
      <div className="flex items-center gap-2.5 min-w-0 z-10">
        <div className="w-6 h-6 rounded-full bg-black/30 p-0.5 shrink-0 flex items-center justify-center border border-white/30">
          <InstagramIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-white font-medium truncate drop-shadow-sm">
          {hasNoAccounts ? (
            <>
              {/* <span className="font-bold text-white">Instagram Account Required:</span> */}
              Connect an account to enable DM automations.
            </>
          ) : (
            <>
              <span className="font-bold text-white">No Active Account:</span> Please activate an Instagram account in settings.
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 z-10">
        <button
          type="button"
          onClick={handleConnectInstagram}
          className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-bold text-[11px] border border-white/30 backdrop-blur-md transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 whitespace-nowrap"
        >
          <InstagramIcon className="w-3.5 h-3.5 text-white shrink-0" />
          {hasNoAccounts ? (
            <>
              <span className="sm:hidden">Connect</span>
              <span className="hidden sm:inline">Connect Instagram</span>
            </>
          ) : (
            <>
              <span className="sm:hidden">Manage</span>
              <span className="hidden sm:inline">Manage Instagram</span>
            </>
          )}
        </button>

      </div>
    </div>
  );

  if (children) {
    return (
      <div className="relative w-full h-full flex flex-col flex-1 min-h-0">
        {bannerJsx}
        <div className="w-full h-full flex flex-col flex-1 min-h-0">
          {children}
        </div>
      </div>
    );
  }

  return bannerJsx;
}
