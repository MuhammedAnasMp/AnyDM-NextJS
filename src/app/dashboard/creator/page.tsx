"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  Check,
  AlertCircle,
  FileText,
  Crown,
  Loader2,
  ArrowRight,
  Calendar,
  Sparkles,
  Zap,
  Star,
  Copy,
  Link2,
  Pencil
} from "lucide-react";
import Toast from "@/components/Toast";
import { Avatar } from "@/components/Avatar";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CreatorDashboardPage() {
  const dispatch = useDispatch();
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"commissions" | "referrals">("commissions");

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ isVisible: false, message: "", type: "success" });

  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Custom Code Editing
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);

  const showToast = (message: string, type: "error" | "success" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchEarnings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/accounts/creator/earnings/", {
        headers: { "x-bypass-cache": "true" }
      });
      setData(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to load creator dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true);
    try {
      const res = await api.post("/accounts/creator/payout-request/");
      showToast(res.data?.message || "Payout request submitted successfully.", "success");
      fetchEarnings();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to submit payout request.";
      showToast(msg, "error");
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const handleCopyReferralLink = () => {
    const code = data?.referral_code || appUser?.referral_code || appUser?.username;
    if (!code) {
      showToast("Referral code not available.", "error");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "https://anydm.in";
    const link = `${origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast("Referral link copied to clipboard.", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveCustomCode = async () => {
    const code = customCodeInput.trim().toUpperCase();
    if (!code) return;
    setIsSavingCode(true);
    try {
      const res = await api.post("/accounts/referral/custom-code/", { code });
      showToast(res.data?.message || `Referral ID updated to ${code}`, "success");
      setData((prev: any) => ({ ...prev, referral_code: code }));
      if (res.data?.user) dispatch(setUser(res.data.user));
      setIsEditingCode(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.details || "Failed to update referral ID.";
      showToast(msg, "error");
    } finally {
      setIsSavingCode(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [appUser]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2.5 font-sans">
        <Loader2 className="w-5 h-5 text-[#c4c0ff] animate-spin" strokeWidth={1.5} />
        <p className="text-xs text-[#8e9192]">Loading Creator Hub...</p>
      </div>
    );
  }

  // Non-creator fallback ONLY if not a creator and API returned error
  if (!appUser?.is_creator_vip && error && !data) {
    return (
      <div className="relative space-y-6 overflow-hidden py-4 w-full font-sans text-[#e5e2e1]">
        <div className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl" />

        <div className="relative w-full space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Monetize your audience with AnyDM
          </h1>
          <p className="text-xs text-[#c4c7c8]/70 leading-relaxed">
            Exclusive partner portal for Instagram creators, digital agencies, and affiliate leaders to earn recurring commissions and access VIP perks.
          </p>
        </div>

        <div className="relative w-full rounded border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-[#20201f] flex items-center justify-center text-[#c4c0ff] shrink-0">
              <Crown className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Creator Partner Program</h2>
              <p className="text-xs text-[#8e9192]">Partner application required</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-[#e5e2e1]">
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
              </div>
              <span>Earn instant commission payouts on referred customer subscriptions</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
              </div>
              <span>Custom referral URL and personalized partner tracking dashboard</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
              </div>
              <span>Complimentary VIP Pro access for qualifying partner creators</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-[#20201f]">
            <a
              href="https://ig.me/m/anydm.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded bg-white hover:bg-zinc-200 text-xs font-bold text-black transition-colors shadow-md"
            >
              <span>Apply for Creator Partner Access</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const rewardType = data?.reward_type || appUser?.creator_reward_type || "vip";
  const commissionPercent = data?.commission_percent || appUser?.creator_commission_percent || 10;
  const totalEarned = data?.total_earned || 0;
  const totalPending = data?.total_pending || 0;
  const totalPaid = data?.total_paid || 0;
  const commissions = data?.commissions || [];
  const totalReferrals = data?.total_referrals || 0;
  const paidReferrals = data?.paid_referrals || 0;
  const referredUsers = data?.referred_users || [];
  const referralCode = data?.referral_code || appUser?.referral_code || appUser?.username || "";

  const creatorExpiresAt = data?.creator_program_expires_at || appUser?.creator_program_expires_at;
  const expiresDate = creatorExpiresAt ? new Date(creatorExpiresAt) : null;
  const now = new Date();

  const isProgramActive = data?.is_creator_program_active ?? appUser?.is_creator_program_active ?? true;
  const isExpired = expiresDate ? expiresDate.getTime() < now.getTime() : (!isProgramActive);

  const formattedEndDate = expiresDate
    ? expiresDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : null;

  const conversionRate =
    totalReferrals > 0
      ? ((paidReferrals / totalReferrals) * 100).toFixed(1)
      : "0.0";

  const isCommissionMode = rewardType === "commission";

  return (
    <div className="relative space-y-5 overflow-hidden  w-full max-w-none font-sans text-[#e5e2e1]">
      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-full -translate-x-1/2 rounded bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl" />

      {/* Top Full-Width Red Warning Banner for Expired Plan */}
      {isExpired && (
        <div className="relative w-full p-4 rounded bg-red-950/50 border border-red-500/40 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-bold text-white text-sm">Creator Partner Plan Expired</p>
              <p className="text-[11px] text-white">
                Your creator partner access term ended{formattedEndDate ? ` on ${formattedEndDate}` : ""}. Renew your partner plan to continue earning active payouts and privileges.
              </p>
            </div>
          </div>
          <a
            href="https://ig.me/m/anydm.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition-colors shrink-0 shadow-md"
          >
            Renew Partner Access
          </a>
        </div>
      )}

      {/* Section Header */}
      <div className="relative w-full space-y-1 pb-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          {isCommissionMode ? "Creator Affiliate Partner Portal" : "VIP Creator Pro Portal"}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-[#c4c7c8]/70 leading-relaxed">
            {isCommissionMode
              ? `Track audience acquisitions, subscription conversions, and direct commission settlements.`
              : `Complimentary Creator Pro partner features, referral metrics, and audience analytics.`}
          </p>

          {formattedEndDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1c1b1b] border border-[#2a2a2a] text-xs shrink-0 self-start sm:self-auto">
              <Calendar className="w-3.5 h-3.5 text-[#c4c0ff]" />
              <span className="text-[#8e9192]">Partner Expiry:</span>
              <span className={`font-semibold ${isExpired ? "text-red-400" : "text-white"}`}>{formattedEndDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Referral Link Card (Full Width) */}
      <div className="relative w-full rounded border border-[#2a2a2a] bg-[#1c1b1b] p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
            <div className="w-10 h-10 rounded bg-[#20201f] flex items-center justify-center text-[#c4c0ff] shrink-0">
              <Link2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 space-y-0.5 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Your Creator Link</span>
                {referralCode && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20201f] text-[#c4c0ff]">
                    ID: {referralCode}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#8e9192] truncate w-full">
                {typeof window !== "undefined" ? window.location.origin : "https://anydm.in"}/signup?ref={referralCode || "..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopyReferralLink}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {!isEditingCode ? (
              <button
                onClick={() => {
                  setCustomCodeInput(referralCode);
                  setIsEditingCode(true);
                }}
                className="px-3.5 py-2 rounded bg-[#20201f] hover:bg-[#2a2a2a] text-xs font-medium text-[#e5e2e1] transition-colors cursor-pointer"
                title="Edit Referral ID"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ID"
                  className="w-24 px-2.5 py-1.5 rounded bg-[#131313] border border-[#2a2a2a] text-xs text-white font-mono uppercase focus:outline-none focus:border-[#c4c0ff]"
                />
                <button
                  onClick={handleSaveCustomCode}
                  disabled={isSavingCode}
                  className="px-3 py-1.5 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors"
                >
                  {isSavingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                </button>
                <button
                  onClick={() => setIsEditingCode(false)}
                  className="px-2 py-1.5 text-xs text-[#8e9192] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {isCommissionMode && !data?.has_kyc ? (
        <div className="relative w-full rounded border border-[#2a2a2a] bg-[#1c1b1b] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#c4c0ff] shrink-0" strokeWidth={1.5} />
            <span className="text-[#c4c7c8]">
              Bank details missing for commission payouts. Add your settlement account info in KYC Settings.
            </span>
          </div>
          <a
            href="/dashboard/settings/kyc"
            className="px-3.5 py-1.5 rounded bg-[#20201f] hover:bg-[#2a2a2a] text-white font-medium transition-colors shrink-0"
          >
            Update KYC Settings
          </a>
        </div>
      ) : isCommissionMode && totalPending >= (data?.min_payout_amount || 500) ? (
        <div className="relative w-full rounded border border-[#c4c0ff]/30 bg-[#c4c0ff]/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#c4c0ff] shrink-0" strokeWidth={1.5} />
            <span className="text-[#e5e2e1]">
              Pending balance of <strong className="text-white">{formatCurrency(totalPending)}</strong> is eligible for payout release.
            </span>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={isRequestingPayout}
            className="px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {isRequestingPayout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
            <span>Request Payout</span>
          </button>
        </div>
      ) : null}

      {/* KPI Stats Cards Grid (Full Width & Compact 2x2 on Mobile) */}
      <div className="relative w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 items-stretch">
        {isCommissionMode ? (
          <>
            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Total Earned</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(totalEarned)}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Lifetime gross earnings</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Pending Clearance</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(totalPending)}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Awaiting next batch</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Total Disbursed</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(totalPaid)}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Settled to bank</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Referral Rate</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {paidReferrals} <span className="text-xs font-normal text-[#8e9192]">/ {totalReferrals}</span>
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">{conversionRate}% conversion rate</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">VIP Access</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {isExpired ? "Expired" : "Active VIP"}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Complimentary Pro</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">VIP Points</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {data?.points ?? appUser?.points ?? 0} pts
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Earned via signups</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Referrals</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {totalReferrals}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">Joined via link</p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded border border-[#2a2a2a] bg-[#1c1b1b] p-3 sm:p-5 shadow-sm sm:shadow-lg group hover:border-[#444748] transition-all">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[#8e9192] truncate">Pro Upgrades</span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {paidReferrals}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#8e9192] truncate">{conversionRate}% rate</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Data Section (Full Width) */}
      <div className="relative w-full rounded border border-[#2a2a2a] bg-[#1c1b1b] shadow-xl overflow-hidden">
        {/* Segmented Control Bar */}
        <div className="p-4 border-b border-[#20201f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 bg-[#131313] p-1 rounded self-start">
            {isCommissionMode && (
              <button
                onClick={() => setActiveTab("commissions")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${activeTab === "commissions"
                  ? "bg-[#20201f] text-[#c4c0ff] shadow-sm"
                  : "text-[#8e9192] hover:text-white"
                  }`}
              >
                Commissions ({commissions.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab("referrals")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${activeTab === "referrals" || !isCommissionMode
                ? "bg-[#20201f] text-[#c4c0ff] shadow-sm"
                : "text-[#8e9192] hover:text-white"
                }`}
            >
              Referred Audience ({referredUsers.length})
            </button>
          </div>

          <span className="text-xs text-[#8e9192]">
            {activeTab === "commissions" ? "Subscription commission activity" : "Acquired user registration log"}
          </span>
        </div>

        {/* Tab Content */}
        {activeTab === "commissions" && isCommissionMode ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#20201f] text-[#8e9192] text-[10px] uppercase tracking-wider font-semibold bg-[#131313]">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Referred User</th>
                  <th className="px-5 py-3">Rate</th>
                  <th className="px-5 py-3">Commission</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20201f]">
                {commissions.length > 0 ? (
                  commissions.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5 text-[#8e9192] font-mono text-[11px]">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-white font-semibold">
                        {c.referred_user || "Referred User"}
                      </td>
                      <td className="px-5 py-3.5 text-[#8e9192]">
                        {c.commission_percent}%
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#c4c0ff] font-mono">
                        +{formatCurrency(c.commission_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs">
                        <span className={c.status === "paid" ? "text-[#c4c0ff] font-medium" : "text-[#8e9192]"}>
                          {c.status === "paid" ? "Disbursed" : "Pending Clearance"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[#8e9192]">
                      No commission transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#20201f] text-[#8e9192] text-[10px] uppercase tracking-wider font-semibold bg-[#131313]">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3 text-right">Subscription Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20201f]">
                {referredUsers.length > 0 ? (
                  referredUsers.map((ref: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5 text-white font-semibold">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={ref.profile_picture_url}
                            name={ref.display_name || ref.username}
                            size="sm"
                            className="w-6 h-6 text-[10px] bg-[#20201f] text-white rounded"
                          />
                          <span>{ref.display_name ? ref.display_name : ref.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#8e9192] font-mono text-[11px]">
                        {new Date(ref.date_joined).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs">
                        {ref.plan === "pro" && ref.is_premium_active ? (
                          <span className="text-[#c4c0ff] font-medium">Pro Upgrade</span>
                        ) : ref.is_premium_active ? (
                          <span className="text-[#c4c0ff] font-medium">Free Trial Active</span>
                        ) : (
                          <span className="text-[#8e9192]">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-[#8e9192]">
                      No referred audience signups recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Policy Card (Full Width) */}
      <div className="relative w-full rounded border border-[#2a2a2a] bg-[#1c1b1b] p-5 space-y-2 text-xs text-[#8e9192]">
        <div className="flex items-center gap-2 text-white font-semibold">
          <FileText className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.5} />
          <span>Partner Program Policy &amp; Disbursement Terms</span>
        </div>
        <p className="leading-relaxed">
          Commissions apply to first-time subscription payments by referred creators using your link. Reconciled payouts are processed directly to your registered bank account or UPI ID. Self-referrals and artificial signups violate partner terms.
        </p>
      </div>
    </div>
  );
}
