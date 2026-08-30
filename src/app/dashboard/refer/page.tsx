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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#c8c6c5] animate-spin" strokeWidth={1.75} />
        <p className="text-xs text-[#c4c7c8]/60">Loading your referral circle...</p>
      </div>
    );
  }

  const referralLink = stats?.referral_code
    ? `${window.location.origin}/signup?ref=${stats.referral_code}`
    : "Generating code...";

  return (
    <div className="space-y-6">
      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Hero promo banner - Exempt from strict flat monochrome rules for high visual appeal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1b1b] to-[#131313] border border-[#2a2a2a] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-[-250px] left-[-250px] w-[500px] h-[500px] rounded-full bg-[#c4c0ff]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-250px] right-[-250px] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

        <div className="space-y-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#c4c0ff]">
            <Gift className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Referral program active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#e5e2e1] leading-tight">
            Invite friends, earn points, and get <span className="text-[#8fe3ff]">premium for free</span>.
          </h1>
          <p className="text-sm text-[#c4c7c8]/70 leading-relaxed">
            Share your custom referral link with fellow creators &amp; audience. Viewers get <span className="text-white font-medium">15 Days Extended Trial</span> when signing up with your link. You earn <span className="text-[#8fe3ff] font-medium">20 points</span> on every referred user's first paid subscription (up to 5 months redemption cap).
          </p>
        </div>

        {/* Points display card - Overlaid on banner using glass effect parameters */}
        <div className="bg-[#20201f]/60 backdrop-blur-md p-5 rounded-xl border border-white/10 w-full md:w-[280px] flex flex-col items-center justify-center text-center gap-4 z-10">
          <span className="text-[11px] font-semibold text-[#c4c7c8]/60 tracking-wider uppercase">Your points balance</span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white tracking-tight">{stats?.points || 0}</span>
            <span className="text-xs text-[#c4c0ff] font-semibold uppercase tracking-wider">pts</span>
          </div>

          {stats?.points >= stats?.points_needed_for_premium && appUser?.plan !== "pro" ? (
            <button
              onClick={handleRedeemPoints}
              disabled={redeemLoading}
              className="w-full bg-[#8fe3ff] hover:bg-[#8fe3ff]/90 text-[#131313] py-2.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#8fe3ff]/10 active:scale-[0.98]"
            >
              {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} /> : <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />}
              <span>Redeem 1 month premium</span>
            </button>
          ) : appUser?.plan === "pro" ? (
            <div className="golden-glow w-full py-2.5 rounded-md border border-amber-300/40 text-[#131313] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,191,0,0.3)] [text-shadow:0_1px_0_rgba(255,245,190,0.6)]">
              <Medal className="w-3.5 h-3.5 fill-current z-10" strokeWidth={1.75} />
              <span className="z-10">Creator pro active</span>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded-md border border-white/5 bg-white/5 text-xs text-[#c4c7c8]/60 flex items-center justify-center gap-1 font-medium">
              <span>{stats?.points_needed_for_premium - (stats?.points || 0)} more points to redeem premium</span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Copy referral link card */}
        <div className="bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.75} />
              <span>Share your referral link to earn points</span>
            </h3>

            {!isEditingCode && (stats?.custom_code_set || appUser?.custom_code_set) && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom ID Set: <strong className="font-mono text-white">{stats?.referral_code}</strong></span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center">
              {isEditingCode ? (
                <>
                  <span className="absolute left-3 text-xs text-zinc-500 font-mono font-semibold z-10 pointer-events-none">
                    ID:
                  </span>
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                    placeholder="e.g. YT200 or CREATOR30"
                    maxLength={20}
                    autoFocus
                    className="w-full bg-[#0e0e0e] border border-[#8fe3ff]/50 rounded-md py-2 pl-9 pr-16 text-xs font-mono text-white tracking-wider outline-none uppercase"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSaveCustomCode}
                      disabled={isSavingCode || !customCodeInput.trim()}
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-30 cursor-pointer"
                      title="Save code"
                    >
                      {isSavingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.2} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.2} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-[#0e0e0e] border border-[#444748] rounded-md py-2 pl-3 pr-9 text-xs font-mono text-[#c4c7c8] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCodeInput(stats?.referral_code || "");
                      setIsEditingCode(true);
                    }}
                    className="absolute right-2 p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Edit custom referral code"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={isEditingCode}
              className={`font-semibold text-xs px-5 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                isEditingCode
                  ? "bg-white/10 text-zinc-500 border border-white/5 cursor-not-allowed opacity-50"
                  : "bg-white hover:bg-[#e2e2e2] text-black cursor-pointer"
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              ) : (
                <Copy className="w-4 h-4" strokeWidth={1.75} />
              )}
              <span>{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
        </div>

        {/* Referred by card */}
        <div className="bg-[#20201f] border border-[#444748] rounded-md p-4">
          <h3 className="text-sm font-semibold text-[#e5e2e1] mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#8fe3ff]" strokeWidth={1.75} />
            <span>Referred by</span>
          </h3>

          {appUser?.referred_by ? (
            <div className="flex-1 bg-[#0e0e0e] border border-[#444748] rounded-md py-2 px-3 text-xs font-mono text-[#c4c7c8] select-all focus:outline-none">
              You were referred by:{" "}
              <span className="text-[#e5e2e1] font-mono font-semibold">
                {appUser.referred_by}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
                If you signed up without a referral link, within 14 days of signup to support them.
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

      </div>
      {/* Referral stats and leaderboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referred friends table */}
        <div className="lg:col-span-2 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8fe3ff]" strokeWidth={1.75} />
              <span>People referred by you</span>
            </h3>
            <span className="bg-white/5 border border-white/10 text-[#c4c7c8] text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats?.referral_count || 0} joined
            </span>
          </div>

          {stats?.referred_users && stats.referred_users.length > 0 ? (
            <div className="flex flex-col justify-between flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] text-[#c4c7c8]/50 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="pb-2.5 font-medium">User</th>
                      <th className="pb-2.5 font-medium">Joined date</th>
                      <th className="pb-2.5 font-medium text-right">Plan status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]/40">
                    {stats.referred_users
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((ref: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 font-medium text-[#e5e2e1]">
                            {ref.display_name ? `${ref.display_name}` : `${ref.username}`}
                          </td>
                          <td className="py-3 text-[#c4c7c8]/70">
                            {new Date(ref.date_joined).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3 text-right">
                            {ref.is_premium_active ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                Active Pro
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#c4c7c8]/50 text-[10px] font-semibold">
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
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#2a2a2a] pt-4 mt-4 gap-2">
                  <span className="text-[11px] text-[#c4c7c8]/60 font-medium">
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
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
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
                          className={`w-7 h-7 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-white text-black font-bold shadow-sm"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
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
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-[#c4c7c8]/40">
                <Users className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <p className="text-xs text-[#c4c7c8]/50">No referrals yet. Share your link to start earning.</p>
            </div>
          )}
        </div>

        {/* Leaderboard layout */}
        <div className="lg:col-span-1 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#c8c6c5]" strokeWidth={1.75} />
            <span>Leaderboard</span>
          </h3>

          <div className="flex flex-col gap-3">
            {stats?.leaderboard && stats.leaderboard.length > 0 ? (
              stats.leaderboard.map((leader: any, idx: number) => {
                const getRankStyle = (rank: number) => {
                  switch (rank) {
                    case 1:
                      return "border-amber-500/20 bg-amber-500/5 text-amber-400";
                    case 2:
                      return "border-slate-300/20 bg-slate-300/5 text-slate-300";
                    case 3:
                      return "border-amber-700/20 bg-amber-700/5 text-amber-600";
                    default:
                      return "border-[#2a2a2a] text-[#c4c7c8]";
                  }
                };
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-md bg-[#131313] border border-[#2a2a2a]/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-[11px] ${getRankStyle(leader.rank)}`}>
                        {leader.rank}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#e5e2e1]">@{leader.display_name}</span>
                        <span className="text-[10px] text-[#c4c7c8]/40">Most referrals</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      <span className="text-xs font-semibold text-[#e5e2e1]">{leader.referral_count}</span>
                      <Award className="w-3.5 h-3.5 text-[#c4c0ff]" strokeWidth={1.75} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-[#c4c7c8]/20" strokeWidth={1.75} />
                <p className="text-xs text-[#c4c7c8]/40">No rank listings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}