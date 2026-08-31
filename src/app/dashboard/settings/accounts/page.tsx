"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Plus,
  Trash2,
  Mail,
  Lock,
  Star,
  CheckCircle2,
  X,
  Play,
  Pause,
  Link2,
  Link2Off,
  AlertCircle,
  Loader2,
  Shield,
  Users,
  User,
  Pencil,
  Clock,
  Gift,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Check,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Hash
} from "lucide-react";
import { Avatar, OverlappingAvatars, UserAvatar } from "@/components/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setInstagramAccounts } from "@/store/slices/authSlice";
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithPopup,
  linkWithCredential
} from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/services/api.service";
import { authService } from "@/lib/services/auth.service";
import Toast from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import InstagramIcon from "@/components/ui/InstagramIcon";

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5"} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

interface ProviderCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isConnected: boolean;
  onAction?: () => void;
  actionText?: string;
  children?: React.ReactNode;
}

const ProviderCard = ({
  icon,
  title,
  subtitle,
  isConnected,
  onAction,
  actionText,
  children
}: ProviderCardProps) => (
  <div className="p-3 sm:p-3.5 rounded-md bg-[#101115] border border-[#2a2a2a] hover:border-[#444748] transition-colors flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 rounded bg-[#1c1b1b] flex items-center justify-center border border-[#2a2a2a] shrink-0 text-[#e5e2e1]">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-[#e5e2e1] truncate">{title}</h4>
            {isConnected && (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-[#8e9192] truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            "px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer shrink-0 active:scale-[0.98]",
            actionText === "Cancel"
              ? "bg-[#1c1b1b] text-[#8e9192] border-[#2a2a2a] hover:text-[#e5e2e1]"
              : isConnected
                ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                : "bg-[#1c1e26] hover:bg-[#252732] border-[#2a2a2a] text-[#e5e2e1]"
          )}
        >
          {actionText || (isConnected ? "Manage" : "Connect")}
        </button>
      )}
    </div>

    {children && <div className="w-full">{children}</div>}
  </div>
);

interface InstagramRowProps {
  account: any;
  isPrimary: boolean;
  onRemove: (id: number) => void;
  onToggleEnabled: (id: number, isEnabled: boolean) => void;
  onToggleLogin: (id: string, newValue: boolean) => void;
  onSetPrimary: (id: number) => void;
  onReLogin: () => void;
}

const InstagramRow = ({
  account,
  isPrimary,
  onRemove,
  onToggleEnabled,
  onToggleLogin,
  onSetPrimary,
  onReLogin
}: InstagramRowProps) => (
  <div
    className={cn(
      "p-3 sm:p-3.5 rounded-md bg-[#101115] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group",
      isPrimary
        ? "border-[#c4c0ff]/40 bg-[#c4c0ff]/[0.03] shadow-[0_0_15px_rgba(196,192,255,0.04)]"
        : "border-[#2a2a2a] hover:border-[#444748] hover:bg-[#14151a]"
    )}
  >
    {/* Account Identity */}
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="relative cursor-pointer select-none shrink-0"
        onClick={() => !isPrimary && !account.is_token_expired && onSetPrimary(account.id)}
        title={isPrimary ? "Primary Account" : "Click to set as primary"}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105 p-0.5 bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center",
            isPrimary && "ring-2 ring-[#c4c0ff]/60 ring-offset-2 ring-offset-[#131313]"
          )}
        >
          <UserAvatar
            src={account.profile_picture_url}
            alt={account.username}
            className="w-full h-full object-cover rounded-full"
            fallbackIcon={<User className="w-4 h-4 text-[#8e9192]" />}
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-0.5 shadow-md">
          <div className="bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 rounded-full text-white">
            <InstagramIcon className="w-2.5 h-2.5" />
          </div>
        </div>
        {isPrimary && (
          <div className="absolute -top-1 -left-1 bg-[#c4c0ff] text-[#131313] p-0.5 rounded-full shadow-lg z-10 border border-[#131313]">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#e5e2e1] tracking-tight group-hover:text-[#c4c0ff] transition-colors truncate">
            @{account.username}
          </span>
        </div>
      </div>
    </div>

    {/* Actions Toolbar */}
    <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2a2a2a]">
      {!isPrimary && !account.is_token_expired && (
        <button
          onClick={() => onSetPrimary(account.id)}
          className="px-2.5 py-1.5 rounded-md border border-[#2a2a2a] hover:border-[#444748] text-zinc-300 hover:text-white text-xs font-medium transition-colors bg-[#1c1b1b] active:scale-[0.98] cursor-pointer"
          title="Set as active primary account"
        >
          Make Primary
        </button>
      )}

      <button
        onClick={() => !account.is_token_expired && onToggleEnabled(account.id, !account.is_enabled)}
        disabled={account.is_token_expired}
        className={cn(
          "p-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer flex items-center gap-1 px-2.5 active:scale-[0.98]",
          account.is_token_expired
            ? "text-[#8e9192] border-[#2a2a2a] bg-[#131313] cursor-not-allowed"
            : account.is_enabled
              ? "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
              : "text-[#34d399] border-[#10b981]/20 bg-[#10b981]/5 hover:bg-[#10b981]/10"
        )}
        title={account.is_token_expired ? "Token expired" : account.is_enabled ? "Pause automations" : "Resume automations"}
      >
        {account.is_enabled ? (
          <>
            <Pause className="w-3.5 h-3.5" />
            <span className="text-[11px]">Pause</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            <span className="text-[11px]">Resume</span>
          </>
        )}
      </button>

      {account.is_token_expired ? (
        <button
          onClick={onReLogin}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-login</span>
        </button>
      ) : (
        <button
          onClick={() => onToggleLogin(account.id, !account.used_for_login)}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all active:scale-[0.98] border cursor-pointer",
            account.used_for_login
              ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
              : "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#353535] border-[#444748] hover:border-[#8e9192]"
          )}
        >
          {account.used_for_login ? <Link2Off className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{account.used_for_login ? "Unlink Login" : "Link Login"}</span>
        </button>
      )}

      <button
        onClick={() => onRemove(account.id)}
        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-md border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
        title="Remove account"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                MAIN CONTENT                                */
/* -------------------------------------------------------------------------- */

function AccountsContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const accounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const isLoading = useSelector(
    (state: RootState) => state.auth.isFetchingAccounts || state.auth.isHydrating
  );

  const [stats, setStats] = useState<any>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(appUser?.display_name || "");
  const [isInstagramLinking, setIsInstagramLinking] = useState(false);
  const [isLinkingEmail, setIsLinkingEmail] = useState(false);
  const [emailToLink, setEmailToLink] = useState("");
  const [passwordToLink, setPasswordToLink] = useState("");
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ isVisible: false, message: "", type: "error" });

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [accountToPause, setAccountToPause] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const showToast = (message: string, type: "error" | "success" | "info" = "error") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/accounts/referral/stats/", {
        headers: { 'x-bypass-cache': 'true' }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching referral stats:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  useEffect(() => {
    if (appUser?.display_name && !isEditingName) {
      setTempName(appUser.display_name);
    }
  }, [appUser?.display_name, isEditingName]);

  // Handle Instagram OAuth code return
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setIsInstagramLinking(true);
      const redirectUri = `${window.location.origin}/dashboard/settings/accounts`;
      authService.exchangeInstagramCode(code, redirectUri, true)
        .then(() => {
          router.replace('/dashboard/settings/accounts');
        })
        .catch((err) => {
          console.error("Instagram linking failed:", err);
          const errorMsg = err.response?.data?.error || "Failed to link account";
          const details = err.response?.data?.details || "";
          showToast(`${errorMsg}: ${details}`, "error");
          router.replace('/dashboard/settings/accounts');
        })
        .finally(() => {
          setIsInstagramLinking(false);
          window.history.replaceState({}, '', '/dashboard/settings/accounts');
        });
    }
  }, [searchParams, router]);

  // Monitor Firebase Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLink = async () => {
    if (!firebaseUser) return;
    try {
      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(firebaseUser, provider);
      const idToken = await result.user.getIdToken();
      await authService.exchangeFirebaseToken(idToken);
      window.location.reload();
    } catch (error: any) {
      console.error("Error linking Google:", error);
      if (error.code === 'auth/credential-already-in-use') {
        showToast("This Google account is already linked to another user.", "error");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Silent
      } else {
        showToast(error.message || "Failed to link Google account.", "error");
      }
    }
  };

  const handleEmailLink = async () => {
    if (!firebaseUser) return;
    if (!isLinkingEmail) {
      setEmailToLink(firebaseUser.email || "");
      setIsLinkingEmail(true);
    } else {
      setIsLinkingEmail(false);
      setPasswordToLink("");
    }
  };

  const handleConfirmEmailLink = async () => {
    if (!emailToLink || !passwordToLink) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    setIsLinkingLoading(true);
    try {
      const credential = EmailAuthProvider.credential(emailToLink, passwordToLink);
      const result = await linkWithCredential(firebaseUser, credential);
      const idToken = await result.user.getIdToken();
      await authService.exchangeFirebaseToken(idToken);

      showToast("Email linked successfully!", "success");
      setIsLinkingEmail(false);
      setPasswordToLink("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error linking Email:', error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('This email is already linked to another account.', "error");
      } else {
        showToast(error.message || 'Failed to link email.', "error");
      }
    } finally {
      setIsLinkingLoading(false);
    }
  };

  const handleAddInstagram = () => {
    const isPremiumActive = appUser?.is_premium_active ?? true;
    if (!isPremiumActive && accounts.length >= 1) {
      showToast("Your plan has expired and you are limited to 1 Instagram account. Please upgrade to add more accounts.", "error");
      return;
    }

    setIsInstagramLinking(true);
    const clientId = "1454663269228644";
    const redirectUri = `${window.location.origin}/dashboard/settings/accounts`;
    const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";
    window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&enable_fb_login=false`;
  };

  const hasGoogle = appUser?.login_methods?.includes('google') ||
    firebaseUser?.providerData?.some((p: any) => p.providerId === 'google.com');

  const hasPassword = appUser?.login_methods?.includes('email') ||
    firebaseUser?.providerData?.some((p: any) => p.providerId === 'password');

  const handleToggleLogin = async (accountId: string, newValue: boolean) => {
    if (accounts.length <= 1 && !newValue) {
      showToast("Cannot disconnect. You must have at least one Instagram account connected for login.", "error");
      return;
    }

    try {
      await api.post(
        "/accounts/auth/instagram/toggle-login/",
        { account_id: accountId, used_for_login: newValue }
      );

      const updatedAccounts = accounts.map(acc =>
        acc.id === accountId ? { ...acc, used_for_login: newValue } : acc
      );
      dispatch(setInstagramAccounts(updatedAccounts));
      const accountName = accounts.find(a => a.id === accountId)?.username || "this account";
      showToast(newValue ? `You can now login with @${accountName}` : "Instagram login disabled", "success");
    } catch (err) {
      console.error("Failed to toggle login", err);
      showToast("Failed to update login method", "error");
    }
  };

  const handleSetPrimary = async (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    if (account && !account.is_enabled) {
      showToast("Please enable the account first to set it as primary.", "info");
      return;
    }
    try {
      await authService.setActiveInstagramAccount(accountId);
      showToast("Primary account updated", "success");
    } catch (err) {
      showToast("Failed to update primary account", "error");
    }
  };

  const handleToggleEnabled = async (accountId: number, isEnabled: boolean) => {
    if (!isEnabled) {
      setAccountToPause(accountId);
      setIsPauseModalOpen(true);
      return;
    }

    try {
      await authService.toggleInstagramEnabled(accountId, isEnabled);
      const updatedAccounts = accounts.map(acc =>
        acc.id === accountId ? { ...acc, is_enabled: isEnabled } : acc
      );
      dispatch(setInstagramAccounts(updatedAccounts));
      showToast("Automations resumed", "success");
    } catch (err) {
      console.error("Failed to toggle enabled", err);
      showToast("Failed to update automation status", "error");
    }
  };

  const confirmPause = async () => {
    if (accountToPause === null) return;
    try {
      await authService.toggleInstagramEnabled(accountToPause, false);
      const updatedAccounts = accounts.map(acc =>
        acc.id === accountToPause ? { ...acc, is_enabled: false } : acc
      );
      dispatch(setInstagramAccounts(updatedAccounts));
      showToast("Automations paused", "success");
    } catch (err) {
      showToast("Failed to pause automations", "error");
    } finally {
      setIsPauseModalOpen(false);
      setAccountToPause(null);
    }
  };

  const confirmRemoveAccount = (id: number) => {
    setAccountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleRemoveAccount = async () => {
    if (accountToDelete === null) return;

    try {
      const result = await authService.removeInstagramAccount(accountToDelete);

      if (result.user_deleted) {
        showToast("Profile deleted as no login methods remain.", "info");
        setTimeout(() => {
          authService.logout();
          router.push("/login");
        }, 2000);
        return;
      }

      const updatedAccounts = accounts.filter(acc => acc.id !== accountToDelete);
      dispatch(setInstagramAccounts(updatedAccounts));
      showToast("Account removed successfully", "success");
    } catch (err) {
      showToast("Failed to remove account", "error");
    }
    setAccountToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleUpdateName = async () => {
    if (!tempName.trim()) {
      setTempName(appUser?.display_name || "");
      setIsEditingName(false);
      return;
    }

    try {
      await authService.updateProfile({ display_name: tempName });
      showToast("Name updated successfully", "success");
    } catch (err) {
      console.error("Failed to update name", err);
      showToast("Failed to update name", "error");
    }
    setIsEditingName(false);
  };

  const getFormattedExpiryDate = () => {
    const rawDate =
      stats?.expires_at ||
      stats?.plan_expires_at ||
      stats?.subscription_expires_at ||
      stats?.expiry_date ||
      appUser?.expires_at ||
      appUser?.plan_expires_at ||
      appUser?.subscription_expires_at ||
      appUser?.trial_expires_at;

    if (rawDate) {
      try {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }
      } catch (e) {
        console.error("Error parsing expiry date:", e);
      }
    }

    const daysLeft = stats?.trial_days_left ?? appUser?.trial_days_left;
    if (typeof daysLeft === "number" && daysLeft > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + daysLeft);
      return expiry.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return null;
  };

  const formattedExpiryDate = getFormattedExpiryDate();
  const trialDaysLeft = stats?.trial_days_left ?? appUser?.trial_days_left ?? 0;
  const isPro = (stats?.plan === "pro" || appUser?.plan === "pro") && (stats?.is_premium_active ?? appUser?.is_premium_active);

  if (!mounted) return null;

  return (
    <div className="relative space-y-6 overflow-hidden  text-[#e5e2e1]">
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />



      {/* MAIN CONTENT CONTAINER */}
      <div className="relative mx-auto space-y-4">

        {/* USER INFO CARD */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-md p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {accounts.length > 0 ? (
              <OverlappingAvatars accounts={accounts} size="md" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#e5e2e1] text-lg font-semibold shrink-0">
                {(appUser?.display_name || appUser?.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleUpdateName}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                    autoFocus
                    className="text-base font-semibold text-white bg-[#131313] border border-[#444748] rounded-md px-2 py-0.5 focus:outline-none focus:border-white transition-colors"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setTempName(appUser?.display_name || "");
                      setIsEditingName(true);
                    }}
                    className="flex items-center gap-2 cursor-pointer group truncate"
                  >
                    <span className="text-base md:text-lg font-semibold text-[#e5e2e1] group-hover:text-[#c4c0ff] transition-colors truncate">
                      {appUser?.email || appUser?.display_name || firebaseUser?.email || "AnyDM User"}
                    </span>
                    <button type="button" className="text-zinc-400 group-hover:text-white transition shrink-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#8e9192] truncate mt-0.5">
                {appUser?.display_name ? `${appUser.display_name} • ` : ""}{appUser?.email || firebaseUser?.email || "Workspace User"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 sm:ml-3 flex-wrap">
            <button
              onClick={handleAddInstagram}
              disabled={isInstagramLinking}
              className="h-8 px-3 rounded-md bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-semibold flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all text-xs cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isInstagramLinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>Connect Account</span>
            </button>

            <div className="border border-[#444748]/60 bg-[#20201f] text-[#c4c7c8] text-xs font-semibold px-3 py-1.5 rounded-md">
              {isPro ? (
                <span className="bg-gradient-to-r from-[#A67C00] via-[#BF9B30] via-[#FFBF00] via-[#FFCF40] to-[#FFDC73] bg-clip-text text-transparent font-bold">
                  Creator Pro
                </span>
              ) : trialDaysLeft > 0 ? (
                `${trialDaysLeft} Days Remaining`
              ) : (
                <span className="text-red-400 font-medium">Trial Expired</span>
              )}
            </div>
          </div>
        </div>

        {/* TWO COLUMN GRID (AUTH & INSTAGRAM) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

          {/* LEFT COLUMN: AUTHENTICATION & SECURITY */}
          <div className="space-y-4 flex flex-col justify-between">

            {/* Authentication & Login Card */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-md p-5 shadow-xl">
              <div className="flex items-center gap-2 text-[#e5e2e1] font-semibold text-sm">
                <Link2 className="w-4 h-4 text-[#c4c0ff]" />
                <h2>Authentication &amp; Login</h2>
              </div>
              <p className="text-[#8e9192] text-xs mt-1">Manage linked single sign-on credentials.</p>

              <h3 className="text-[#e5e2e1] text-xs font-semibold mt-5 mb-3">Linked Login Credentials</h3>

              <div className="space-y-2.5">
                {/* Google Row */}
                <ProviderCard
                  icon={<GoogleIcon className="w-5 h-5" />}
                  title="Google Account"
                  subtitle={hasGoogle ? "One-click login credential linked" : "One-click login credential"}
                  isConnected={hasGoogle}
                  onAction={hasGoogle ? undefined : handleGoogleLink}
                />

                {/* Email & Password Row */}
                <ProviderCard
                  icon={<Mail className="w-4 h-4 text-zinc-400" />}
                  title="Email &amp; Password"
                  subtitle={firebaseUser?.email || appUser?.email || "Manage password login access"}
                  isConnected={hasPassword}
                  onAction={hasPassword ? undefined : handleEmailLink}
                  actionText={isLinkingEmail ? "Cancel" : "Connect"}
                >
                  {isLinkingEmail && !hasPassword && (
                    <div className="flex flex-col gap-2 w-full mt-2 pt-2 border-t border-[#2a2a2a]">
                      <input
                        type="email"
                        value={emailToLink}
                        onChange={(e) => setEmailToLink(e.target.value)}
                        placeholder="Enter account email"
                        className="w-full bg-[#131313] border border-[#2a2a2a] rounded-md py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#8e9192] transition-colors"
                      />
                      <input
                        type="password"
                        value={passwordToLink}
                        onChange={(e) => setPasswordToLink(e.target.value)}
                        placeholder="Create password"
                        className="w-full bg-[#131313] border border-[#2a2a2a] rounded-md py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#8e9192] transition-colors"
                      />
                      <button
                        onClick={handleConfirmEmailLink}
                        disabled={isLinkingLoading}
                        className="w-full bg-white text-black rounded-md py-1.5 text-xs font-semibold hover:bg-[#eaeaea] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLinkingLoading ? "Connecting..." : "Link Credentials"}
                      </button>
                    </div>
                  )}
                </ProviderCard>
              </div>
            </div>

            {/* Meta Security Card */}
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-md p-4 shadow-xl">
              <div className="flex items-center gap-2 text-[#e5e2e1] font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#c4c0ff]" />
                <span>Meta Security &amp; Token Encryption</span>
              </div>
              <p className="text-[#8e9192] text-[11px] leading-relaxed mt-2">
                AnyDM uses long-lived OAuth tokens obtained via Meta Graph API v25.0. Credentials are tokenized with AES-256 encryption. We never access personal passphrases.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: INSTAGRAM CONNECTION & PROFILES */}
          <div className="bg-[#1c1b1b] border border-[#c4c0ff]/30 rounded-md p-5 flex flex-col justify-between relative shadow-xl shadow-purple-950/10 min-h-[380px]">

            {/* Top Row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2 text-[#e5e2e1] font-semibold text-sm">
                <Hash className="w-4 h-4 text-[#c4c0ff]" />
                <h2>Instagram Account</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#20201f] border border-[#2a2a2a] text-[#c4c7c8] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
                </span>
              </div>
            </div>

            {/* Center Area: Connected Accounts List OR Empty Glow CTA */}
            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#8e9192] flex flex-col items-center justify-center gap-2 my-auto">
                <Loader2 className="w-6 h-6 animate-spin text-[#c4c0ff]" />
                <span>Loading connected Instagram profiles...</span>
              </div>
            ) : accounts.length > 0 ? (
              <div className="my-4 space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {accounts.map((acc: any) => (
                  <InstagramRow
                    key={acc.id}
                    account={acc}
                    isPrimary={appUser?.active_instagram_account_id === acc.id}
                    onRemove={confirmRemoveAccount}
                    onToggleEnabled={handleToggleEnabled}
                    onToggleLogin={handleToggleLogin}
                    onSetPrimary={handleSetPrimary}
                    onReLogin={handleAddInstagram}
                  />
                ))}
              </div>
            ) : (
              /* Center Instagram Icon with Glow */
              <div className="flex flex-col items-center justify-center my-8 md:my-10">
                <div className="relative flex items-center justify-center">
                  {/* Glow backdrop */}
                  <div className="absolute w-28 h-28 bg-gradient-to-tr from-pink-600/30 via-purple-600/20 to-orange-500/30 rounded-full blur-2xl"></div>

                  {/* Circular Button Outer */}
                  <div className="w-20 h-20 rounded-full bg-[#131313] border border-[#444748]/50 flex items-center justify-center relative shadow-inner">
                    {/* Instagram Gradient Icon */}
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <linearGradient id="ig-grad" x1="2" y1="21" x2="22" y2="3" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FFDD55" />
                          <stop offset="30%" stopColor="#FF543E" />
                          <stop offset="70%" stopColor="#C837AB" />
                          <stop offset="100%" stopColor="#3771C8" />
                        </linearGradient>
                      </defs>
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" />
                      <circle cx="18" cy="6" r="1" fill="url(#ig-grad)" />
                    </svg>
                  </div>
                </div>

                <p className="text-[#e5e2e1] text-xs md:text-sm font-medium mt-4">No Instagram accounts connected</p>
                <p className="text-[11px] text-[#8e9192] text-center max-w-xs mt-1">
                  Link your Instagram Business or Creator profile to start automating DMs, comments, &amp; sales.
                </p>
              </div>
            )}


          </div>

        </div>

      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <ConfirmationModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        onConfirm={confirmPause}
        title="Pause Automations?"
        message="All DMs and comment trigger automations for this account will be paused until manually resumed."
        confirmText="Pause Account"
        isDestructive={false}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveAccount}
        title={accounts.length === 1 ? "Delete All Account Data?" : "Remove Instagram Account?"}
        message={
          accounts.length === 1
            ? "Removing your only connected Instagram account will disable all active automations."
            : "Are you sure you want to disconnect this Instagram account from your workspace?"
        }
        confirmText={accounts.length === 1 ? "Delete & Disconnect" : "Remove Account"}
        isDestructive={true}
      />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-[#c4c0ff] animate-spin" />
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}