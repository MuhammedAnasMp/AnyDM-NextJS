"use client";

import { useEffect, useState, Suspense } from "react";
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
  Settings,
  Users,
  Pencil,
  Clock,
  Gift
} from "lucide-react";
import { Avatar, OverlappingAvatars } from "@/components/Avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setInstagramAccounts, setUser } from "@/store/slices/authSlice";
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



const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ProviderCard = ({ icon, title, subtitle, isConnected, onAction, actionText, children }: any) => (
  <div className="p-4 rounded-md bg-[#1c1b1b] border border-[#444748]/60 hover:border-[#444748] hover:bg-[#20201f] transition-colors duration-200 flex flex-col gap-4 relative">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-md bg-[#2a2a2a] flex items-center justify-center border border-[#444748] shrink-0 text-[#e5e2e1]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-[#e5e2e1] tracking-tight leading-none">{title}</h3>
          {isConnected && (
            <span className="bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-[9px] font-semibold uppercase px-2 py-0.5 rounded tracking-wider leading-none">
              Linked
            </span>
          )}
        </div>
        <p className="text-xs text-[#c4c7c8]/60 mt-1.5 leading-relaxed break-all">{subtitle}</p>
      </div>
    </div>

    {onAction && (
      <button
        onClick={onAction}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2 rounded-md text-xs font-semibold transition-colors active:scale-[0.98] border cursor-pointer mt-auto",
          (actionText === "Cancel" || isConnected)
            ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
            : "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#353535] border-[#444748] hover:border-[#8e9192]"
        )}
      >
        {actionText === "Cancel" ? (
          <X className="w-3.5 h-3.5" />
        ) : isConnected ? (
          <Link2Off className="w-3.5 h-3.5" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
        <span>{actionText || (isConnected ? "Disconnect" : "Connect")}</span>
      </button>
    )}

    {children && (
      <div className="w-full">
        {children}
      </div>
    )}
  </div>
);

const InstagramRow = ({ account, isPrimary, onRemove, onToggleEnabled, onToggleLogin, onSetPrimary }: any) => (
  <div className={cn(
    "flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 last:mb-0 rounded-md bg-[#1c1b1b] border transition-colors duration-200 group",
    isPrimary
      ? "border-[#8FE3FF]/30 bg-[#8FE3FF]/5 shadow-[0_0_20px_rgba(143,227,255,0.05)]"
      : "border-[#444748]/60 hover:border-[#444748] hover:bg-[#20201f]"
  )}>
    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
      <div
        className="relative cursor-pointer select-none"
        onClick={() => !isPrimary && onSetPrimary(account.id)}
      >
        <div className={cn(
          "w-12 h-12 rounded-full overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-105 p-0.5 bg-zinc-800",
          isPrimary && "ring-2 ring-[#8FE3FF]/50 ring-offset-2 ring-offset-[#131313]"
        )}>
          <img
            src={account.profile_picture_url || "https://i.pravatar.cc/150?u=ig"}
            alt={account.username}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-1 shadow-md">
          <div className="insta-gradient p-0.5 rounded-full text-white">
            <InstagramIcon className="w-2.5 h-2.5" />
          </div>
        </div>
        {isPrimary && (
          <div className="absolute -top-1.5 -left-1.5 bg-[#8FE3FF] text-[#131313] p-1 rounded-full shadow-lg z-10 border border-[#131313]">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2.5">
          <span className="text-sm font-semibold text-[#e5e2e1] group-hover:text-[#8fe3ff] transition-colors">@{account.username}</span>
          {account.is_enabled ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399] text-[9px] font-semibold uppercase tracking-wider border border-[#34d399]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-semibold uppercase tracking-wider border border-red-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Paused
            </span>
          )}
        </div>
        <span className="text-xs text-[#c4c7c8]/60 truncate max-w-[220px] block mt-1">{account.full_name || "Instagram business account"}</span>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={() => onToggleEnabled(account.id, !account.is_enabled)}
          className={cn(
            "flex items-center justify-center p-2 text-xs font-semibold rounded-md border border-transparent transition-colors cursor-pointer",
            account.is_enabled
              ? "text-amber-400 hover:bg-amber-500/10"
              : "text-[#34d399] hover:bg-[#34d399]/10"
          )}
          title={account.is_enabled ? "Pause automations" : "Resume automations"}
        >
          {account.is_enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onRemove(account.id)}
          className="flex items-center justify-center p-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
          title="Delete account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onToggleLogin(account.id, !account.used_for_login)}
        className={cn(
          "flex items-center justify-center gap-2 w-32 py-2 rounded-md text-xs font-semibold transition-colors active:scale-[0.98] border cursor-pointer",
          account.used_for_login
            ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
            : "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#353535] border-[#444748] hover:border-[#8e9192]"
        )}
      >
        {account.used_for_login ? <Link2Off className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        <span>{account.used_for_login ? "Disconnect" : "Connect"}</span>
      </button>
    </div>
  </div>
);

function AccountsContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const appUser = useSelector((state: RootState) => state.auth.user);
  const accounts = useSelector((state: RootState) => state.auth.instagramAccounts);
  const isLoading = useSelector((state: RootState) => state.auth.isFetchingAccounts || state.auth.isHydrating);

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

  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  const [globalSettings, setGlobalSettings] = useState({
    trial_days: 14,
    extend_days: 7,
    referral_points: 50,
    points_to_redeem: 100,
    premium_plan_price: 499.00
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    api.get("/accounts/settings/system/")
      .then(res => {
        setGlobalSettings(res.data);
      })
      .catch(err => console.error("Error fetching global settings:", err));
  }, []);

  const handleSubmitReferral = async () => {
    if (!referralCodeInput.trim()) return;
    setIsSubmittingReferral(true);
    try {
      const res = await api.post("/accounts/referral/set-referred-by/", {
        code: referralCodeInput.trim()
      });
      showToast(res.data.message, "success");
      dispatch(setUser(res.data.user));
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.error || "Failed to set referrer.";
      showToast(msg, "error");
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await api.post("/accounts/settings/system/", globalSettings);
      showToast("Global system settings updated!", "success");
      setGlobalSettings(res.data.settings);
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.error || "Failed to save settings.";
      showToast(msg, "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const showToast = (message: string, type: "error" | "success" | "info" = "error") => {
    setToast({ isVisible: true, message, type });
  };

  const getAccountTypeLabel = () => {
    if (appUser?.plan === "pro") {
      return { text: "Creator Pro", color: "text-amber-400", icon: Star };
    }
    const trialDaysLeft = appUser?.trial_days_left ?? 0;
    const isPremiumActive = appUser?.is_premium_active ?? false;

    if (isPremiumActive) {
      if (appUser?.has_extended_trial) {
        return { text: `Extended trial (${trialDaysLeft} days left)`, color: "text-[#8FE3FF]", icon: Clock };
      }
      return { text: `Free trial (${trialDaysLeft} days left)`, color: "text-[#34d399]", icon: Clock };
    } else {
      return { text: "Trial expired", color: "text-red-400", icon: AlertCircle };
    }
  };

  const planInfo = getAccountTypeLabel();
  const PlanIcon = planInfo.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (appUser?.display_name && !isEditingName) {
      setTempName(appUser.display_name);
    }
  }, [appUser?.display_name, isEditingName]);

  // Handle Instagram OAuth code
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
      return;
    } else {
      setIsLinkingEmail(false);
      setPasswordToLink("");
      return;
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

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [accountToPause, setAccountToPause] = useState<number | null>(null);

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

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

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#444748] pb-6">
        <div className="flex items-center gap-4">
          {accounts.length > 0 ? (
            <OverlappingAvatars accounts={accounts} size="md" />
          ) : (
            <Avatar
              src={firebaseUser?.photoURL}
              name={appUser?.display_name || "User"}
              size="lg"
            />
          )}
          <div>
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                autoFocus
                className="text-xl font-semibold text-[#e5e2e1] bg-transparent border-b border-[#444748] focus:border-[#e5e2e1] focus:outline-none py-0.5"
              />
            ) : (
              <h1
                onClick={() => {
                  setTempName(appUser?.display_name || "");
                  setIsEditingName(true);
                }}
                className="text-xl font-semibold tracking-tight text-[#e5e2e1] flex items-center gap-2 cursor-pointer group"
              >
                <span>{appUser?.display_name || "AnyDM User"}</span>
                <Pencil className="w-3.5 h-3.5 text-[#c4c7c8]/60 group-hover:text-[#e5e2e1] transition-colors" strokeWidth={1.75} />
              </h1>
            )}
            <p className={`text-xs ${planInfo.color} mt-1 flex items-center gap-1.5 font-semibold`}>
              <PlanIcon className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{planInfo.text}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleAddInstagram}
          disabled={isInstagramLinking}
          className="insta-gradient text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all text-xs cursor-pointer disabled:opacity-50"
        >
          {isInstagramLinking ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
          ) : (
            <InstagramIcon className="w-4 h-4 mr-1" />
          )}
          <span>Add new Instagram</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Connections */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
            <h3 className="text-sm font-semibold text-[#e5e2e1] mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#e5e2e1]" strokeWidth={1.75} />
              <span>Connected accounts</span>
            </h3>

            <div className="flex flex-col gap-3">
              <ProviderCard
                icon={<GoogleIcon className="w-5 h-5" />}
                title="Google account"
                subtitle={hasGoogle ? "Connected securely via Google" : "One-click secure login"}
                isConnected={hasGoogle}
                onAction={hasGoogle ? undefined : handleGoogleLink}
              />

              <ProviderCard
                icon={<Mail className="w-5 h-5 text-[#c4c7c8]" />}
                title="Email & password"
                subtitle={firebaseUser?.email || "Connect an email address"}
                isConnected={hasPassword}
                onAction={hasPassword ? undefined : handleEmailLink}
                actionText={isLinkingEmail ? "Cancel" : "Connect"}
              >
                {isLinkingEmail && !hasPassword && (
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <input
                      type="email"
                      value={emailToLink}
                      onChange={(e) => setEmailToLink(e.target.value)}
                      placeholder="Enter account email"
                      className="w-full bg-[#131313] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192] transition-colors"
                    />
                    <input
                      type="password"
                      value={passwordToLink}
                      onChange={(e) => setPasswordToLink(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-[#131313] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192] transition-colors"
                    />
                    <button
                      onClick={handleConfirmEmailLink}
                      disabled={isLinkingLoading}
                      className="w-full bg-white text-black rounded py-2 text-xs font-semibold hover:bg-[#eaeaea] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLinkingLoading ? "Connecting..." : "Link account"}
                    </button>
                  </div>
                )}
              </ProviderCard>
            </div>
          </div>

          <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
            <div className="flex gap-3">
              <Shield className="w-4 h-4 text-[#e5e2e1] shrink-0 mt-0.5" strokeWidth={1.75} />
              <div>
                <h4 className="font-semibold text-xs text-[#e5e2e1] mb-1">Data & privacy</h4>
                <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
                  We use official Graph API tokens and Firebase Authentication. Your passwords are never stored on our servers. You can revoke access from Facebook at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Referral Entry Card */}
          <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
            <h3 className="text-sm font-semibold text-[#e5e2e1] mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#8fe3ff]" strokeWidth={1.75} />
              <span>Referred by</span>
            </h3>

            {appUser?.referred_by ? (
              <div className="p-3 bg-[#1c1b1b] border border-[#444748] rounded-md text-xs text-[#c4c7c8]/80 leading-relaxed">
                You were referred by: <span className="text-[#e5e2e1] font-mono font-semibold">{appUser.referred_by}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
                  If you signed up without a referral link, you can add your referrer's code below within 14 days of signup to support them.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    placeholder="Enter REF-XXXXXX"
                    className="flex-1 bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] uppercase focus:outline-none focus:border-[#8e9192]"
                  />
                  <button
                    onClick={handleSubmitReferral}
                    disabled={isSubmittingReferral}
                    className="bg-white text-black font-semibold text-xs px-4 py-2 rounded transition-colors cursor-pointer hover:bg-[#eaeaea] disabled:opacity-50"
                  >
                    {isSubmittingReferral ? "..." : "Link"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Global Configuration Card (Demo Settings) */}
          <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
            <h3 className="text-sm font-semibold text-[#e5e2e1] mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.75} />
              <span>Global config (admin demo)</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#c4c7c8]/60">Default trial days</label>
                <input
                  type="number"
                  value={globalSettings.trial_days}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, trial_days: parseInt(e.target.value) || 0 })}
                  className="bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#c4c7c8]/60">Extend days (7-day button)</label>
                <input
                  type="number"
                  value={globalSettings.extend_days}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, extend_days: parseInt(e.target.value) || 0 })}
                  className="bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#c4c7c8]/60">Referral points (per referral)</label>
                <input
                  type="number"
                  value={globalSettings.referral_points}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, referral_points: parseInt(e.target.value) || 0 })}
                  className="bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#c4c7c8]/60">Points to redeem premium</label>
                <input
                  type="number"
                  value={globalSettings.points_to_redeem}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, points_to_redeem: parseInt(e.target.value) || 0 })}
                  className="bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[#c4c7c8]/60">Premium paid plan price (INR)</label>
                <input
                  type="number"
                  value={globalSettings.premium_plan_price}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, premium_plan_price: parseFloat(e.target.value) || 0 })}
                  className="bg-[#1c1b1b] border border-[#444748] rounded py-2 px-3 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 hover:bg-[#c4c0ff]/20 text-[#c4c0ff] font-semibold text-xs py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
              >
                {isSavingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save configuration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Instagram Accounts List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e5e2e1]" strokeWidth={1.75} />
                <span>Instagram accounts</span>
              </h3>
              <span className="px-2.5 py-1 bg-[#2a2a2a] text-[#e5e2e1] rounded-full text-[10px] font-semibold">
                {accounts.length} accounts active
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-[#c4c7c8]/60">Loading connected accounts...</div>
              ) : accounts.length > 0 ? (
                accounts.map((acc: any) => (
                  <InstagramRow
                    key={acc.id}
                    account={acc}
                    isPrimary={appUser?.active_instagram_account_id === acc.id}
                    onRemove={confirmRemoveAccount}
                    onToggleEnabled={handleToggleEnabled}
                    onToggleLogin={handleToggleLogin}
                    onSetPrimary={handleSetPrimary}
                  />
                ))
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center bg-[#1c1b1b] rounded-md border border-dashed border-[#444748]">
                  <InstagramIcon className="w-8 h-8 text-[#c4c7c8]/30 mb-3" />
                  <p className="text-xs text-[#c4c7c8]/60 mb-4">No Instagram accounts connected yet.</p>
                  <button
                    onClick={handleAddInstagram}
                    className="bg-white text-black px-4 py-2 rounded-md font-semibold text-xs transition-colors active:scale-[0.98] cursor-pointer hover:bg-[#eaeaea]"
                  >
                    Connect first account
                  </button>
                </div>
              )}
            </div>
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
        title="Pause automations?"
        message="All automations for this account will be blocked until you turn them back on. This account will not reply to any DMs or comments while paused."
        confirmText="Pause account"
        isDestructive={false}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveAccount}
        title={accounts.length === 1 ? "Delete all data?" : "Remove account?"}
        message={accounts.length === 1
          ? "Are you sure? This is your last connected account. Removing it will delete all your automations and related data from the dashboard."
          : "Are you sure you want to disconnect this Instagram account? You will not be able to log in with this account anymore."
        }
        confirmText={accounts.length === 1 ? "Delete everything" : "Remove account"}
        isDestructive={true}
      />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-12 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
      </div>
    }>
      <AccountsContent />
    </Suspense>
  );
}