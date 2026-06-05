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
  AlertCircle
} from "lucide-react";
import { Avatar, OverlappingAvatars } from "@/components/Avatar";
import { motion } from "framer-motion";
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
import axios from "axios";
import { authService } from "@/lib/services/auth.service";
import Toast from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ProviderRow = ({ icon, title, subtitle, isConnected, onAction, actionText, inlineContent, children }: any) => (
  <div className="flex flex-col border-b border-white/5 last:border-0">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
      {(!inlineContent || isConnected) && (
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shadow-sm">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              {isConnected && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Linked
                </span>
              )}
            </div>
            <p className="text-xs text-[#c4c7c8]/60 mt-0.5">{subtitle}</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-3">
        {inlineContent}
        {onAction && (
          <button
            onClick={onAction}
            className={cn(
              "flex items-center justify-center gap-2 w-32 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shrink-0 border cursor-pointer shadow-sm",
              (actionText === "Cancel" || isConnected)
                ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                : "bg-white/5 text-white hover:bg-white/10 border-white/10 hover:border-white/20"
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
      </div>
    </div>
    {children && (
      <div className="px-5 pb-5 md:hidden">
        {children}
      </div>
    )}
  </div>
);

const InstagramRow = ({ account, isPrimary, onRemove, onToggleEnabled, onToggleLogin, onSetPrimary }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-2 last:mb-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group">
    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
      <div
        className="relative cursor-pointer select-none"
        onClick={() => !isPrimary && onSetPrimary(account.id)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm transition-all group-hover:scale-105">
          <img
            src={account.profile_picture_url || "https://i.pravatar.cc/150?u=ig"}
            alt={account.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#131313] rounded-full p-0.5 shadow-sm">
          <div className="insta-gradient p-0.5 rounded-full text-white">
            <InstagramIcon className="w-2.5 h-2.5" />
          </div>
        </div>
        {isPrimary && (
          <div className="absolute -top-1 -left-1 bg-white text-black p-1 rounded-full shadow-lg z-10 ring-2 ring-[#131313]">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-white">@{account.username}</span>
          {account.is_enabled ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Disabled
            </span>
          )}
        </div>
        <span className="text-xs text-[#c4c7c8]/60 truncate max-w-[180px] block mt-0.5">{account.full_name || "Instagram Business Account"}</span>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        <button
          onClick={() => onToggleEnabled(account.id, !account.is_enabled)}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
            account.is_enabled
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-emerald-400 hover:bg-emerald-500/10"
          )}
          title={account.is_enabled ? "Pause Automations" : "Resume Automations"}
        >
          {account.is_enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onRemove(account.id)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
          title="Delete Account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onToggleLogin(account.id, !account.used_for_login)}
        className={cn(
          "flex items-center justify-center gap-2 w-32 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] border cursor-pointer shadow-sm",
          account.used_for_login
            ? "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
            : "bg-white/5 text-white hover:bg-white/10 border-white/10 hover:border-white/20"
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

  const showToast = (message: string, type: "error" | "success" | "info" = "error") => {
    setToast({ isVisible: true, message, type });
  };

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
      const token = localStorage.getItem('access_token');
      await axios.post(
        `https://${process.env.NEXT_PUBLIC_API_URL}/api/accounts/auth/instagram/toggle-login/`,
        { account_id: accountId, used_for_login: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
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
                className="text-xl font-bold text-white bg-transparent border-b border-white/20 focus:border-white focus:outline-none py-0.5"
              />
            ) : (
              <h1 
                onClick={() => {
                  setTempName(appUser?.display_name || "");
                  setIsEditingName(true);
                }}
                className="text-xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer group"
              >
                <span>{appUser?.display_name || "AnyDM User"}</span>
                <span className="material-symbols-outlined text-sm text-[#c4c7c8]/60 group-hover:text-white transition-colors">edit</span>
              </h1>
            )}
            <p className="text-xs text-[#c4c7c8]/60 mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>AnyDM Premium Member</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleAddInstagram}
          disabled={isInstagramLinking}
          className="insta-gradient text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-50"
        >
          {isInstagramLinking ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
          ) : (
            <InstagramIcon className="w-4 h-4 mr-1" />
          )}
          <span>Add New Instagram</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary Connections */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-pane p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-white">link</span>
              <span>Connected Accounts</span>
            </h3>

            <div className="space-y-4">
              <ProviderRow
                icon={<GoogleIcon className="w-5 h-5" />}
                title="Google Account"
                subtitle={hasGoogle ? "Connected securely via Google" : "One-click secure login"}
                isConnected={hasGoogle}
                onAction={hasGoogle ? undefined : handleGoogleLink}
              />

              <ProviderRow
                icon={<Mail className="w-5 h-5 text-[#c4c7c8]" />}
                title="Email & Password"
                subtitle={firebaseUser?.email || "Connect an email address"}
                isConnected={hasPassword}
                onAction={hasPassword ? undefined : handleEmailLink}
                actionText={isLinkingEmail ? "Cancel" : "Connect"}
                inlineContent={isLinkingEmail && !hasPassword && (
                  <div className="hidden md:flex flex-col gap-2 w-full mt-2">
                    <input
                      type="email"
                      value={emailToLink}
                      onChange={(e) => setEmailToLink(e.target.value)}
                      placeholder="Enter account email"
                      className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      value={passwordToLink}
                      onChange={(e) => setPasswordToLink(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={handleConfirmEmailLink}
                      disabled={isLinkingLoading}
                      className="w-full bg-white text-black rounded-lg py-1.5 text-xs font-bold hover:bg-[#eaeaea] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLinkingLoading ? "Connecting..." : "Link account"}
                    </button>
                  </div>
                )}
              >
                {isLinkingEmail && !hasPassword && (
                  <div className="md:hidden flex flex-col gap-2 w-full mt-2">
                    <input
                      type="email"
                      value={emailToLink}
                      onChange={(e) => setEmailToLink(e.target.value)}
                      placeholder="Enter account email"
                      className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      value={passwordToLink}
                      onChange={(e) => setPasswordToLink(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <button
                      onClick={handleConfirmEmailLink}
                      disabled={isLinkingLoading}
                      className="w-full bg-white text-black rounded-lg py-1.5 text-xs font-bold hover:bg-[#eaeaea] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLinkingLoading ? "Connecting..." : "Link account"}
                    </button>
                  </div>
                )}
              </ProviderRow>
            </div>
          </div>

          <div className="glass-pane p-6 rounded-2xl">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-white">shield</span>
              <div>
                <h4 className="font-bold text-xs text-white mb-1">Data &amp; Privacy</h4>
                <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
                  We use official Graph API tokens and Firebase Authentication. Your passwords are never stored on our servers. You can revoke access from Facebook at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instagram Accounts List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-pane p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-white">groups</span>
                <span>Instagram Accounts</span>
              </h3>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold">
                {accounts.length} Accounts Active
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
                <div className="p-8 text-center flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <InstagramIcon className="w-8 h-8 text-white/20 mb-3" />
                  <p className="text-xs text-[#c4c7c8]/60 mb-4">No Instagram accounts connected yet.</p>
                  <button
                    onClick={handleAddInstagram}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 cursor-pointer hover:bg-[#eaeaea]"
                  >
                    Connect First Account
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
        title="Pause Automations?"
        message="All automations for this account will be blocked until you turn them back on. This account will not reply to any DMs or comments while paused."
        confirmText="Pause Account"
        isDestructive={false}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRemoveAccount}
        title={accounts.length === 1 ? "Delete All Data?" : "Remove Account?"}
        message={accounts.length === 1
          ? "Are you sure? This is your last connected account. Removing it will delete all your automations and related data from the dashboard."
          : "Are you sure you want to disconnect this Instagram account? You will not be able to log in with this account anymore."
        }
        confirmText={accounts.length === 1 ? "Delete Everything" : "Remove Account"}
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
