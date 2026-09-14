"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import { Gift, Copy, Check, X, Users, Trophy, Award, Star, Loader2, Medal, Sparkles, Pencil, ChevronLeft, ChevronRight, RefreshCw, Crown } from "lucide-react";
import Toast from "@/components/Toast";
import { Avatar } from "@/components/Avatar";

export default function ReferPage() {
  const dispatch = useDispatch();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [claimFollowLoading, setClaimFollowLoading] = useState(false);
  const [isVerifyingFollow, setIsVerifyingFollow] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ isVisible: false, message: "", type: "success" });

  const [followClickCount, setFollowClickCount] = useState(0);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ isVisible: true, message, type });
  };

  const handleCopyLink = () => {
    if (!stats?.referral_code) return;
    const link = `${window.location.origin}/signup?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setToast({
      isVisible: true,
      message: "Referral link copied to clipboard",
      type: "success"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomCode = async () => {
    const code = customCodeInput.trim().toUpperCase();
    if (!code) return;
    setIsSavingCode(true);
    try {
      const res = await api.post("/accounts/referral/custom-code/", { code });
      showToast(res.data?.message || `Referral ID set to ${code}!`, "success");
      setStats((prev: any) => ({ ...prev, referral_code: code, custom_code_set: true }));
      if (res.data?.user) dispatch(setUser(res.data.user));
      setIsEditingCode(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.details || "Failed to update referral ID.";
      showToast(msg, "error");
    } finally {
      setIsSavingCode(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/accounts/referral/stats/", {
        headers: { 'x-bypass-cache': 'true' }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching referral stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFollowClickCount(0);
    fetchStats();
  }, [
    appUser?.active_instagram_account_id,
    appUser?.active_instagram_account,
    appUser?.active_instagram_account?.id,
    appUser?.id
  ]);

  const handleFollowButtonClick = async () => {
    const officialHandle = stats?.official_instagram_handle || "anydm.in";
    const nextCount = followClickCount + 1;

    if (nextCount === 1) {
      window.open(`https://instagram.com/${officialHandle}`, "_blank", "noopener,noreferrer");
      setFollowClickCount(1);
    } else {
      setClaimFollowLoading(true);
      try {
        const res = await api.post("/accounts/official-follow/claim/");
        const ptsAwarded = res.data?.points_awarded || stats?.official_follow_points || 50;
        showToast(res.data?.message || `Success! +${ptsAwarded} points added for following @${officialHandle}.`, "success");
        if (res.data?.user) dispatch(setUser(res.data.user));
        setStats((prev: any) => ({
          ...prev,
          points: res.data?.points ?? ((prev?.points || 0) + ptsAwarded),
          is_following_official_account: true,
          official_follow_points_awarded: ptsAwarded,
        }));
        setFollowClickCount(0);
      } catch (err: any) {
        const msg = err.response?.data?.error || err.response?.data?.details || "Failed to claim follow reward.";
        showToast(msg, "error");
      } finally {
        setClaimFollowLoading(false);
      }
    }
  };

  const handleRefreshFollowStatus = async () => {
    setIsVerifyingFollow(true);
    try {
      const res = await api.get("/accounts/referral/stats/", {
        headers: { 'x-bypass-cache': 'true' }
      });
      setStats(res.data);
      const activeHandle = res.data?.active_ig_handle ? `@${res.data.active_ig_handle}` : "your active connected account";
      if (res.data?.is_following_official_account) {
        showToast(`Verified! ${activeHandle} is following @anydm.in (+${res.data.official_follow_points_awarded || 50} pts)`, "success");
      } else {
        showToast(`Status checked for ${activeHandle}: Click 'Follow & Claim' to verify and claim points.`, "info");
      }
    } catch (err) {
      showToast("Failed to refresh follow status.", "error");
    } finally {
      setIsVerifyingFollow(false);
    }
  };

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

  const handleRedeemPoints = async () => {
    if (!stats || stats.points < stats.points_needed_for_premium) {
      setToast({
        isVisible: true,
        message: `You need at least ${stats?.points_needed_for_premium} points to redeem premium.`,
        type: "error"
      });
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await api.post("/accounts/plan/redeem-points/");
      setToast({
        isVisible: true,
        message: "Premium plan redeemed successfully with points",
        type: "success"
      });
      dispatch(setUser(res.data.user));
      fetchStats();
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.error || "Redemption failed.";
      setToast({
        isVisible: true,
        message: msg,
        type: "error"
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-[#c4c0ff] animate-spin" />
        <p className="text-xs text-[#c4c7c8]/60">Loading your referral circle...</p>
      </div>
    );
  }

  const referralLink = stats?.referral_code
    ? `${window.location.origin}/signup?ref=${stats.referral_code}`
    : "Generating code...";

  return (
    <div className="relative space-y-4 overflow-hidden py-1 text-[#e5e2e1] w-full font-sans">
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[500px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/10 to-[#c4c0ff]/0 blur-3xl"
      />

      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Hero promo banner */}
      <div className="relative overflow-hidden rounded-md bg-[#1c1b1b] border border-[#2a2a2a] p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5 max-w-xl z-10">
          <h1 className="text-xl md:text-2xl font-medium tracking-tight text-[#e5e2e1] leading-snug">
            Invite friends, earn points, and get <span className="text-[#c4c0ff] font-semibold">Creator Pro for free</span>.
          </h1>
          <p className="text-xs md:text-sm text-[#c4c7c8] leading-relaxed">
            Share your custom referral link. Invited creators get <span className="text-white font-medium">15 Days Extended Trial</span> upon signup. You earn <span className="text-[#c4c0ff] font-semibold">20 points</span> on every referred user's first subscription.
          </p>
        </div>

        {/* Points display card */}
        <div className="bg-[#101115] p-4 rounded-md border border-[#2a2a2a] w-full md:w-[240px] flex flex-col items-center justify-center text-center gap-2.5 z-10 shrink-0 shadow-inner">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8e9192]">Your Points Balance</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stats?.points || 0}</span>
            <span className="text-xs text-[#c4c0ff] font-semibold">pts</span>
          </div>

          {stats?.points >= stats?.points_needed_for_premium && appUser?.plan !== "pro" ? (
            <button
              onClick={handleRedeemPoints}
              disabled={redeemLoading}
              className="w-full bg-[#c4c0ff] hover:bg-[#b0acfc] text-zinc-950 py-1.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 fill-current" />}
              <span>Redeem 1 Month Pro</span>
            </button>
          ) : appUser?.plan === "pro" ? (
            <div className="golden-glow w-full py-1.5 rounded border border-amber-300/40 text-[#131313] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,191,0,0.25)]">
              <Medal className="w-3.5 h-3.5 fill-current z-10" />
              <span className="z-10">Creator Pro Active</span>
            </div>
          ) : (
            <div className="w-full py-1.5 rounded border border-[#2a2a2a] bg-[#1c1b1b] text-[11px] text-[#8e9192] flex items-center justify-center gap-1 font-medium">
              <span>{stats?.points_needed_for_premium - (stats?.points || 0)} more points to redeem</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Follow @anydm.in Reward Card — hidden once claimed */}
      {!stats?.is_following_official_account && (
        <div className="relative overflow-hidden rounded-md bg-[#1c1b1b] border border-[#2a2a2a] p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-sm">
          <div className="flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs md:text-sm text-[#e5e2e1] font-medium leading-tight">
                Follow <span className="font-semibold text-white">@{stats?.official_instagram_handle || "anydm.in"}</span> from <span className="font-semibold text-white">{stats?.active_ig_handle || appUser?.instagram_accounts?.find((acc: any) => acc.id === appUser?.active_instagram_account_id)?.username || appUser?.active_instagram_account?.username || appUser?.username}</span> to get <span className="text-[#c4c0ff] font-semibold">+{stats?.official_follow_points || 50} pts</span>
              </h3>
            </div>
          </div>

          <div className="z-10 shrink-0 w-full sm:w-auto flex items-center gap-2">
            {stats?.is_following_official_account ? (
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-[#101115] border border-[#2a2a2a] text-xs font-medium text-[#e5e2e1]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#c4c0ff]/15 border border-[#c4c0ff]/30 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3] text-[#c4c0ff]" />
                </div>
                <span className="font-semibold text-white">{stats?.official_follow_points_awarded || stats?.official_follow_points || 50} Points Claimed</span>
                <span className="text-[#8e9192] text-[11px] font-normal border-l border-[#2a2a2a] pl-2 hidden sm:inline">Following @{stats?.official_instagram_handle || "anydm.in"}</span>
              </div>
            ) : (
              <>
                {/* Refresh / Check Status Button */}
                <button
                  onClick={handleRefreshFollowStatus}
                  disabled={isVerifyingFollow}
                  title="Refresh and verify follow status for active account"
                  className="p-2 rounded bg-[#101115] border border-[#2a2a2a] text-[#8e9192] hover:text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingFollow ? "animate-spin text-[#c4c0ff]" : ""}`} />
                </button>

                <button
                  onClick={handleFollowButtonClick}
                  disabled={claimFollowLoading}
                  className="w-full sm:w-auto bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs px-3.5 py-1.5 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  {claimFollowLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  <span>Follow to Claim {stats?.official_follow_points || 50} Points</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Copy link & Referred by grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Copy referral link card */}
        <div className="bg-[#1c1b1b] p-4 rounded-md border border-[#2a2a2a] flex flex-col gap-2.5 shadow-sm">
          <h2 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
            <Copy className="w-4 h-4 text-[#c4c0ff]" />
            <span>Share your referral link</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center">
              {isEditingCode ? (
                <>
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                    placeholder="e.g. YT200 or CREATOR30"
                    maxLength={20}
                    autoFocus
                    className="w-full bg-[#101115] border border-[#c4c0ff]/60 rounded py-1.5 pl-3 pr-14 text-xs font-semibold text-white tracking-wide outline-none focus:ring-1 focus:ring-[#c4c0ff]/40"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSaveCustomCode}
                      disabled={isSavingCode || !customCodeInput.trim()}
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      title="Save code"
                    >
                      {isSavingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="p-1 text-[#8e9192] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-[#101115] border border-[#2a2a2a] rounded py-1.5 pl-3 pr-8 text-xs font-medium text-[#c4c7c8] select-all outline-none focus:border-[#c4c0ff]/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCodeInput(stats?.referral_code || "");
                      setIsEditingCode(true);
                    }}
                    className="absolute right-2 p-1 text-[#8e9192] hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Edit custom referral code"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isEditingCode}
              className={`font-semibold text-xs px-3.5 py-1.5 rounded transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98] ${isEditingCode
                ? "bg-white/10 text-zinc-500 border border-white/5 cursor-not-allowed opacity-50"
                : "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer shadow-sm"
                }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
        </div>

        {/* Referred by card */}
        <div className="bg-[#1c1b1b] p-4 rounded-md border border-[#2a2a2a] flex flex-col gap-2.5 shadow-sm">
          <h2 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#c4c0ff]" />
            <span>Referred by</span>
          </h2>

          {appUser?.referred_by ? (
            <div className="bg-[#101115] border border-[#2a2a2a] rounded py-1.5 px-3 text-xs font-medium text-[#c4c7c8] select-all outline-none">
              You were referred by:{" "}
              <span className="text-[#e5e2e1] font-semibold">
                {appUser.referred_by}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-[#8e9192] leading-relaxed">
                If you signed up without a referral link, enter your friend's referral code below within 14 days.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter referral code"
                  className="flex-1 bg-[#101115] border border-[#2a2a2a] rounded py-1.5 px-3 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none focus:border-[#c4c0ff]"
                />

                <button
                  onClick={handleSubmitReferral}
                  disabled={isSubmittingReferral}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 rounded transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm"
                >
                  {isSubmittingReferral ? "Linking..." : "Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral stats and leaderboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Referred friends table */}
        <div className="lg:col-span-2 bg-[#1c1b1b] p-4 rounded-md border border-[#2a2a2a] flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <h2 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c4c0ff]" />
              <span>People referred by you</span>
            </h2>
            <span className="bg-[#20201f] border border-[#2a2a2a] text-[#c4c7c8] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              {stats?.referral_count || 0} joined
            </span>
          </div>

          {stats?.referred_users && stats.referred_users.length > 0 ? (
            <div className="flex flex-col justify-between flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] text-[#8e9192] text-[11px] font-semibold uppercase tracking-wide">
                      <th className="pb-2 font-semibold">User</th>
                      <th className="pb-2 font-semibold">Joined date</th>
                      <th className="pb-2 font-semibold text-right">Plan status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]/60">
                    {stats.referred_users
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((ref: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 font-medium text-[#e5e2e1]">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={ref.profile_picture_url}
                                name={ref.display_name || ref.username}
                                size="sm"
                                className="w-6 h-6 text-[10px] bg-[#20201f] text-[#e5e2e1] border border-[#2a2a2a]"
                              />
                              <span>{ref.display_name ? ref.display_name : ref.username}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-[#8e9192] text-[11px]">
                            {new Date(ref.date_joined).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-2.5 text-right">
                            {ref.is_premium_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/25 text-[#c4c0ff] text-[11px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c4c0ff]"></span>
                                Creator Pro
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] text-[11px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8e9192]/60"></span>
                                Extended Trial
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {Math.ceil((stats?.referred_users?.length || 0) / itemsPerPage) > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#2a2a2a] pt-2.5 mt-2 gap-2">
                  <span className="text-[11px] text-[#8e9192]">
                    Showing <span className="text-white font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(currentPage * itemsPerPage, stats.referred_users.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{stats.referred_users.length}</span> referrals
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.ceil(stats.referred_users.length / itemsPerPage) },
                        (_, i) => i + 1
                      ).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-5 h-5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${currentPage === pageNum
                            ? "bg-white text-zinc-950 font-bold shadow-sm"
                            : "bg-[#20201f] text-[#8e9192] hover:text-white"
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(stats.referred_users.length / itemsPerPage), p + 1)
                        )
                      }
                      disabled={currentPage === Math.ceil(stats.referred_users.length / itemsPerPage)}
                      className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded bg-[#20201f] flex items-center justify-center border border-[#2a2a2a] text-[#8e9192]">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs text-[#8e9192]">No referrals yet. Share your link to start earning.</p>
            </div>
          )}
        </div>

        {/* Leaderboard layout */}
        <div className="lg:col-span-1 bg-[#1c1b1b] p-4 rounded-md border border-[#2a2a2a] flex flex-col gap-3 shadow-sm">
          <div className="pb-2 border-b border-[#2a2a2a]">
            <h2 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#c4c0ff]" />
              <span>Leaderboard</span>
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {stats?.leaderboard && stats.leaderboard.length > 0 ? (
              stats.leaderboard.map((leader: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-md bg-[#101115] border border-[#2a2a2a] flex items-center justify-between transition-colors hover:border-[#353535]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 flex items-center justify-center font-bold text-xs shrink-0">
                      {leader.rank === 1 ? (
                        <Crown className="w-4 h-4 text-[#c4c0ff] fill-[#c4c0ff]/20" />
                      ) : (
                        <span className={leader.rank <= 3 ? "text-[#e5e2e1] font-semibold" : "text-[#8e9192] font-medium"}>
                          #{leader.rank}
                        </span>
                      )}
                    </div>

                    <Avatar
                      src={leader.profile_picture_url}
                      name={leader.display_name || leader.username}
                      size="sm"
                      className="w-7 h-7 text-xs bg-[#20201f] text-[#e5e2e1] border border-[#2a2a2a]"
                    />

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[#e5e2e1] truncate">@{leader.display_name || leader.username}</span>
                      <span className="text-[10px] text-[#8e9192]">
                        {leader.referral_count} {leader.referral_count === 1 ? "referral" : "referrals"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#20201f] border border-[#2a2a2a] px-2.5 py-1 rounded-full shrink-0">
                    <span className="text-xs font-bold text-[#c4c0ff]">{leader.referral_count}</span>
                    <span className="text-[10px] text-[#8e9192] font-normal">joined</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 flex flex-col items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-[#8e9192]" />
                <p className="text-xs text-[#8e9192]">No rank listings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}