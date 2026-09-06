"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Crown,
  Loader2,
  ArrowRight
} from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CreatorDashboardPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ isVisible: false, message: "", type: "success" });

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

  useEffect(() => {
    if (appUser?.is_creator_vip) {
      fetchEarnings();
    } else {
      setIsLoading(false);
    }
  }, [appUser]);

  const referralCode = appUser?.referral_code || "";

  if (!appUser?.is_creator_vip) {
    return (
      <div className="w-full relative space-y-6 overflow-hidden py-8">
        <div className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl" />
        <div className="relative max-w-lg mx-auto text-center p-6 md:p-8 rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#c4c0ff]">
            <Crown className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-[#e5e2e1]">Creator Access Required</h2>
          <p className="text-xs text-[#c4c7c8]/70 leading-relaxed">
            The Creator Hub is an exclusive portal for AnyDM partner creators, affiliates, and community leaders. If you are interested in partnering with us, reach out to our team.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <a
              href="https://ig.me/m/anydm.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-white hover:bg-zinc-200 text-xs font-bold text-zinc-950 transition-all shadow-sm"
            >
              <span>Contact anydm.in</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-[#c4c0ff] animate-spin" strokeWidth={1.5} />
        <p className="text-xs text-[#c4c7c8]/60">Loading creator earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 text-[#ffb4ab]">
        <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        <p className="text-xs">{error}</p>
        <button
          onClick={fetchEarnings}
          className="px-4 py-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#e5e2e1] rounded text-xs font-medium transition-colors border border-[#444748]"
        >
          Try Again
        </button>
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

  const conversionRate =
    totalReferrals > 0
      ? ((paidReferrals / totalReferrals) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="w-full relative space-y-6 overflow-hidden py-2">
      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Background Soft Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/10 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* Section Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#20201f]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#c4c0ff] px-2.5 py-0.5 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20">
              Partner Portal
            </span>
            <span className="text-xs font-mono font-medium text-[#8e9192]">
              ID: {referralCode || "Creator"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#e5e2e1]">
            Creator Partner Hub
          </h1>
          <p className="text-xs text-[#c4c7c8]/70 leading-relaxed">
            Monitor referred acquisitions, conversion metrics, and commission payouts in real time.
          </p>
        </div>

        {/* Current Active Plan Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] text-xs self-start md:self-auto">
          {rewardType === "commission" ? (
            <>
              <DollarSign className="w-3.5 h-3.5 text-[#c4c0ff]" strokeWidth={1.5} />
              <span className="text-[#c4c7c8]/70">Reward Mode:</span>
              <span className="font-semibold text-[#e5e2e1]">
                {commissionPercent}% First-Purchase Commission
              </span>
            </>
          ) : (
            <>
              <Crown className="w-3.5 h-3.5 text-[#c4c0ff]" strokeWidth={1.5} />
              <span className="text-[#c4c7c8]/70">Reward Mode:</span>
              <span className="font-semibold text-[#c4c0ff]">
                VIP Free Pro Access
              </span>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        {/* Total Earned Card */}
        <div className="flex flex-col justify-between rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] p-4 shadow-sm hover:border-[#353535] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#c4c0ff] tracking-wide flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Total Earned</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#c4c7c8] font-medium">
                Gross
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">
                {formatCurrency(totalEarned)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8e9192]">
              Total lifetime commissions credited.
            </p>
          </div>
        </div>

        {/* Pending Payout Card */}
        <div className="flex flex-col justify-between rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] p-4 shadow-sm hover:border-[#353535] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#e5e2e1] tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8e9192]" strokeWidth={1.5} />
                <span>Pending Clearance</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#8e9192] font-medium">
                Unsettled
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">
                {formatCurrency(totalPending)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8e9192]">
              Awaiting next scheduled payout batch.
            </p>
          </div>
        </div>

        {/* Total Paid Out Card */}
        <div className="flex flex-col justify-between rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] p-4 shadow-sm hover:border-[#353535] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#c4c0ff] tracking-wide flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Total Settled</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 text-[#c4c0ff] font-medium">
                Disbursed
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8e9192]">
              Directly transferred to bank account.
            </p>
          </div>
        </div>

        {/* Referral Conversion Card */}
        <div className="flex flex-col justify-between rounded-lg border border-[#c4c0ff]/20 bg-[#1c1b1b] p-4 shadow-sm hover:border-[#c4c0ff]/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#c4c0ff] tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Referrals</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 text-[#c4c0ff] font-medium">
                {conversionRate}% Rate
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">
                {paidReferrals}
              </span>
              <span className="text-xs text-[#8e9192]">
                paid / {totalReferrals} total
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8e9192]">
              Paid conversions from your link.
            </p>
          </div>
        </div>
      </div>

      {/* Commission Transactions Table */}
      <div className="w-full rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#20201f] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.5} />
            <h3 className="text-sm font-bold text-[#e5e2e1]">
              Commission History
            </h3>
          </div>
          <span className="text-[11px] text-[#8e9192]">
            Recorded on each referred user&apos;s first purchase
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#20201f] text-[#8e9192] text-[10px] uppercase tracking-wider font-semibold bg-[#131313]">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Referred User</th>
                <th className="px-4 py-3">Purchase Amount</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20201f]">
              {commissions.length > 0 ? (
                commissions.map((c: any) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#c4c7c8] whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-[#e5e2e1] font-medium">
                      {c.referred_user || "Referred User"}
                    </td>
                    <td className="px-4 py-3 text-[#c4c7c8] font-mono">
                      {formatCurrency(c.payment_amount)}
                    </td>
                    <td className="px-4 py-3 text-[#8e9192]">
                      {c.commission_percent}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#c4c0ff] font-mono">
                      +{formatCurrency(c.commission_amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${
                          c.status === "paid"
                            ? "bg-[#c4c0ff]/10 text-[#c4c0ff] border-[#c4c0ff]/30"
                            : "bg-white/5 text-[#c4c7c8] border-white/10"
                        }`}
                      >
                        {c.status === "paid" ? "Settled" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-[#8e9192]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Wallet
                        className="w-5 h-5 mx-auto mb-1 opacity-30 text-[#c4c0ff]"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs text-[#c4c7c8] font-medium">
                        No commissions recorded yet
                      </span>
                      <span className="text-[11px] text-[#8e9192] max-w-sm">
                        When users register with your link and subscribe to Creator Pro, their first payment generates immediate commission here.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creator Agreement & Terms */}
      <div className="w-full rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#20201f]">
          <FileText className="w-4 h-4 text-[#c4c0ff]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#e5e2e1]">
            Creator Partner Program Agreement &amp; Terms
          </span>
        </div>

        <div className="text-[11px] text-[#c4c7c8]/70 leading-relaxed space-y-2">
          <p>
            By participating in the AnyDM Creator Partner Program, you agree to the following operational terms:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#8e9192]">
            <li>
              <strong className="text-[#e5e2e1]">First Payment Commission:</strong> Commissions are calculated exclusively on the first subscription purchase made by a referred user. Renewal transactions in subsequent months do not trigger additional referral payouts.
            </li>
            <li>
              <strong className="text-[#e5e2e1]">Custom Commission Rate:</strong> The commission percentage is determined and configured per creator by AnyDM administration and can be updated with prior notice.
            </li>
            <li>
              <strong className="text-[#e5e2e1]">Mutually Exclusive Modes:</strong> A creator account can have either VIP Free Pro access OR Commission-based earnings active at any one time.
            </li>
            <li>
              <strong className="text-[#e5e2e1]">Disbursements:</strong> Payouts are reconciled and settled directly to your verified bank account by the AnyDM finance team.
            </li>
            <li>
              <strong className="text-[#e5e2e1]">Compliance &amp; Anti-Fraud:</strong> Self-referrals, automated signups, and fraudulent chargebacks will result in immediate commission disqualification and partner account termination.
            </li>
          </ul>
          <p className="pt-2 text-[10px] text-[#8e9192] border-t border-[#20201f]">
            For support regarding payout status, banking info updates, or switching reward modes, email us at{" "}
            <span className="text-[#c4c0ff] font-medium">support@zoyee.in</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
