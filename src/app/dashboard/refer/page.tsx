"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import { Gift, Copy, Check, Users, Trophy, Award, Star, Loader2 } from "lucide-react";
import Toast from "@/components/Toast";

export default function ReferPage() {
  const dispatch = useDispatch();
  const appUser = useSelector((state: RootState) => state.auth.user);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
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
    <div className="space-y-6 max-w-6xl mx-auto  p-6 sm:px-6 ">
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
            Share your unique referral link with fellow creators. For every friend who signs up, you get <span className="text-white font-medium">{stats?.referral_points} points</span>. Collect <span className="text-white font-medium">{stats?.points_needed_for_premium} points</span> to redeem a free month of premium subscription.
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
            <div className="w-full py-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
              <span>Creator pro active</span>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded-md border border-white/5 bg-white/5 text-xs text-[#c4c7c8]/60 flex items-center justify-center gap-1 font-medium">
              <span>{stats?.points_needed_for_premium - (stats?.points || 0)} more points to redeem premium</span>
            </div>
          )}
        </div>
      </div>

      {/* Copy referral link card */}
      <div className="bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
          <Copy className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.75} />
          <span>Share your referral link</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-[#0e0e0e] border border-[#444748] rounded-md py-2 px-3 text-xs font-mono text-[#c4c7c8] select-all focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="bg-white hover:bg-[#e2e2e2] text-black font-semibold text-xs px-5 py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={1.75} /> : <Copy className="w-4 h-4" strokeWidth={1.75} />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2a2a2a] text-[#c4c7c8]/50 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="pb-2.5 font-medium">User</th>
                    <th className="pb-2.5 font-medium">Joined date</th>
                    {/* <th className="pb-2.5 font-medium">Plan status</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]/40">
                  {stats.referred_users.map((ref: any, idx: number) => (
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
                      {/* <td className="py-3">
                        {ref.is_premium_active ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#c4c7c8]/50 text-[10px] font-semibold">
                            Expired
                          </span>
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
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