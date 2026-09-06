"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import { Gift, Copy, Check, X, Users, Trophy, Award, Star, Loader2, Medal, Sparkles, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import Toast from "@/components/Toast";

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
    fetchStats();
  }, []);

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

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ isVisible: true, message, type });
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

  const handleFollowAndClaim = async () => {
    window.open("https://instagram.com/anydm.in", "_blank", "noopener,noreferrer");
    setClaimFollowLoading(true);
    try {
      const res = await api.post("/accounts/official-follow/claim/");
      showToast(res.data?.message || "Success! +50 points added for following @anydm.in.", "success");
      if (res.data?.user) dispatch(setUser(res.data.user));
      setStats((prev: any) => ({
        ...prev,
        points: res.data?.points ?? ((prev?.points || 0) + 50),
        is_following_official_account: true,
        official_follow_points_awarded: 50,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.details || "Failed to claim follow reward.";
      showToast(msg, "error");
    } finally {
      setClaimFollowLoading(false);
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
    <div className="relative space-y-5 overflow-hidden py-2 text-[#e5e2e1] w-full font-sans">
      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
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
      <div className="relative overflow-hidden rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">

          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#e5e2e1] leading-tight">
            Invite friends, earn points, and get <span className="text-[#c4c0ff]">Creator Pro for free</span>.
          </h1>
          <p className="text-xs md:text-sm text-[#c4c7c8] leading-relaxed">
            Share your custom referral link. Invited creators get <span className="text-white font-semibold">15 Days Extended Trial</span> upon signup. You earn <span className="text-[#c4c0ff] font-semibold">20 points</span> on every referred user's first subscription.
          </p>
        </div>

        {/* Points display card */}
        <div className="bg-[#101115] p-5 rounded-lg border border-[#2a2a2a] w-full md:w-[260px] flex flex-col items-center justify-center text-center gap-3 z-10 shrink-0 shadow-md">
          <span className="text-[11px] font-semibold text-[#8e9192]">Your Points Balance</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">{stats?.points || 0}</span>
            <span className="text-xs text-[#c4c0ff] font-semibold">pts</span>
          </div>

          {stats?.points >= stats?.points_needed_for_premium && appUser?.plan !== "pro" ? (
            <button
              onClick={handleRedeemPoints}
              disabled={redeemLoading}
              className="w-full bg-[#c4c0ff] hover:bg-[#b0acfc] text-zinc-950 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
            >
              {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 fill-current" />}
              <span>Redeem 1 Month Pro</span>
            </button>
          ) : appUser?.plan === "pro" ? (
            <div className="golden-glow w-full py-2 rounded-md border border-amber-300/40 text-[#131313] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,191,0,0.3)]">
              <Medal className="w-3.5 h-3.5 fill-current z-10" />
              <span className="z-10">Creator Pro Active</span>
            </div>
          ) : (
            <div className="w-full py-2 rounded-md border border-[#2a2a2a] bg-[#1c1b1b] text-[11px] text-[#8e9192] flex items-center justify-center gap-1 font-medium">
              <span>{stats?.points_needed_for_premium - (stats?.points || 0)} more points to redeem</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Follow @anydm.in Reward Card */}
      <div className="relative overflow-hidden rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0 shadow-md">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs md:text-sm font-semibold text-[#e5e2e1]">
                Follow @anydm.in on Instagram
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 text-[#c4c0ff]">
                +{stats?.official_follow_points || 50} pts
              </span>
            </div>
            <p className="text-[11px] text-[#8e9192] mt-0.5">
              Follow our official Instagram for feature drops, tutorials &amp; unlock an instant {stats?.official_follow_points || 50} points bounty.
            </p>
          </div>
        </div>

        <div className="z-10 shrink-0 w-full sm:w-auto">
          {stats?.is_following_official_account ? (
            <div className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>50 Points Claimed (Following @anydm.in)</span>
            </div>
          ) : (
            <button
              onClick={handleFollowAndClaim}
              disabled={claimFollowLoading}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs px-5 py-2 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {claimFollowLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              )}
              <span>Follow &amp; Claim 50 Points</span>
            </button>
          )}
        </div>
      </div>

      {/* Copy link & Referred by grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Copy referral link card */}
        <div className="bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-3 shadow-xl">
          <h3 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
            <Copy className="w-4 h-4 text-[#c4c0ff]" />
            <span>Share your referral link</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-2.5">
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
                    className="w-full bg-[#101115] border border-[#c4c0ff]/50 rounded-md py-2 pl-3 pr-16 text-xs font-semibold text-white tracking-wide outline-none"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSaveCustomCode}
                      disabled={isSavingCode || !customCodeInput.trim()}
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                      title="Save code"
                    >
                      {isSavingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="p-1 text-[#8e9192] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
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
                    className="w-full bg-[#101115] border border-[#2a2a2a] rounded-md py-2 pl-3 pr-9 text-xs font-medium text-[#c4c7c8] select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCodeInput(stats?.referral_code || "");
                      setIsEditingCode(true);
                    }}
                    className="absolute right-2 p-1 text-[#8e9192] hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                    title="Edit custom referral code"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isEditingCode}
              className={`font-semibold text-xs px-4 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98] ${isEditingCode
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
        <div className="bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-3 shadow-xl">
          <h3 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#c4c0ff]" />
            <span>Referred by</span>
          </h3>

          {appUser?.referred_by ? (
            <div className="bg-[#101115] border border-[#2a2a2a] rounded-md py-2 px-3 text-xs font-medium text-[#c4c7c8] select-all outline-none">
              You were referred by:{" "}
              <span className="text-[#e5e2e1] font-semibold">
                {appUser.referred_by}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] text-[#8e9192] leading-relaxed">
                If you signed up without a referral link, enter your friend's referral code below within 14 days.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter referral code"
                  className="flex-1 bg-[#101115] border border-[#2a2a2a] rounded-md py-1.5 px-3 text-xs text-[#e5e2e1] placeholder-[#8e9192] outline-none focus:border-[#c4c0ff]"
                />

                <button
                  onClick={handleSubmitReferral}
                  disabled={isSubmittingReferral}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs px-4 py-1.5 rounded-md transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm"
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
        <div className="lg:col-span-2 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <h3 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c4c0ff]" />
              <span>People referred by you</span>
            </h3>
            <span className="bg-[#20201f] border border-[#2a2a2a] text-[#c4c7c8] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {stats?.referral_count || 0} joined
            </span>
          </div>

          {stats?.referred_users && stats.referred_users.length > 0 ? (
            <div className="flex flex-col justify-between flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] text-[#8e9192] text-[11px] font-semibold">
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
                          <td className="py-2.5 font-semibold text-[#e5e2e1]">
                            {ref.display_name ? `${ref.display_name}` : `${ref.username}`}
                          </td>
                          <td className="py-2.5 text-[#8e9192]">
                            {new Date(ref.date_joined).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-2.5 text-right">
                            {ref.is_premium_active ? (
                              <span className="px-2 py-0.5 rounded-md bg-[#10b981]/10 border border-[#10b981]/30 text-[#34d399] text-[10px] font-semibold">
                                Active Pro
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#8e9192] text-[10px] font-semibold">
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
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#2a2a2a] pt-3 mt-3 gap-2">
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
                      className="p-1 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                          className={`w-6 h-6 rounded-md text-xs font-semibold transition-colors cursor-pointer ${currentPage === pageNum
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
                      className="p-1 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-md bg-[#20201f] flex items-center justify-center border border-[#2a2a2a] text-[#8e9192]">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs text-[#8e9192]">No referrals yet. Share your link to start earning.</p>
            </div>
          )}
        </div>

        {/* Leaderboard layout */}
        <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-4 shadow-xl">
          <div className="pb-2 border-b border-[#2a2a2a]">
            <h3 className="text-xs md:text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#c4c0ff]" />
              <span>Leaderboard</span>
            </h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {stats?.leaderboard && stats.leaderboard.length > 0 ? (
              stats.leaderboard.map((leader: any, idx: number) => {
                const getRankStyle = (rank: number) => {
                  switch (rank) {
                    case 1:
                      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
                    case 2:
                      return "border-slate-300/30 bg-slate-300/10 text-slate-300";
                    case 3:
                      return "border-amber-700/30 bg-amber-700/10 text-amber-500";
                    default:
                      return "border-[#2a2a2a] text-[#8e9192]";
                  }
                };
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-[#101115] border border-[#2a2a2a] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-[10px] shrink-0 ${getRankStyle(leader.rank)}`}>
                        {leader.rank}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#e5e2e1] truncate">@{leader.display_name}</span>
                        <span className="text-[10px] text-[#8e9192]">Most referrals</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#20201f] border border-[#2a2a2a] px-2 py-0.5 rounded-md shrink-0">
                      <span className="text-xs font-semibold text-[#e5e2e1]">{leader.referral_count}</span>
                      <Award className="w-3.5 h-3.5 text-[#c4c0ff]" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 flex flex-col items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-[#8e9192]" />
                <p className="text-xs text-[#8e9192]">No rank listings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}