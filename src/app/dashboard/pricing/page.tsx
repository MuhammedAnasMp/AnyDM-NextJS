"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import { Check, CreditCard, Sparkles, Star, Zap, Gift, RefreshCw, Loader2, Calendar } from "lucide-react";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const appUser = useSelector((state: RootState) => state.auth.user);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);
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
      console.error("Error fetching subscription stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPayLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setToast({
          isVisible: true,
          message: "Failed to load Razorpay SDK. Check your network.",
          type: "error"
        });
        setPayLoading(false);
        return;
      }

      // 1. Create order in backend
      const orderRes = await api.post("/accounts/razorpay/create-order/");
      const { order_id, amount, currency, key_id } = orderRes.data;

      // 2. Open Razorpay checkout modal
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "AnyDM Premium",
        description: "One-Time Premium Plan Subscription",
        order_id: order_id,
        handler: async (response: any) => {
          setPayLoading(true);
          try {
            // 3. Verify signature in backend
            const verifyRes = await api.post("/accounts/razorpay/verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            setToast({
              isVisible: true,
              message: "Premium Plan purchased successfully!",
              type: "success"
            });
            dispatch(setUser(verifyRes.data.user));
            fetchStats();
          } catch (err: any) {
            const msg = err.response?.data?.details || err.response?.data?.error || "Payment verification failed.";
            setToast({
              isVisible: true,
              message: msg,
              type: "error"
            });
          } finally {
            setPayLoading(false);
          }
        },
        prefill: {
          name: appUser?.display_name || "",
          email: appUser?.email || "",
        },
        theme: {
          color: "#131313",
        },
        modal: {
          ondismiss: () => {
            setPayLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Razorpay payment initialization failed:", err);
      const msg = err.response?.data?.details || err.response?.data?.error || "Failed to initiate checkout.";
      setToast({
        isVisible: true,
        message: msg,
        type: "error"
      });
      setPayLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!stats || stats.points < stats.points_needed_for_premium) {
      setToast({
        isVisible: true,
        message: `You need at least ${stats?.points_needed_for_premium} points to redeem premium. You have ${stats?.points || 0}.`,
        type: "error"
      });
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await api.post("/accounts/plan/redeem-points/");
      setToast({
        isVisible: true,
        message: "Premium Plan redeemed successfully with points!",
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

  const handleExtendTrial = async () => {
    setExtendLoading(true);
    try {
      const res = await api.post("/accounts/plan/extend-trial/");
      setToast({
        isVisible: true,
        message: "Your trial has been extended by 7 days!",
        type: "success"
      });
      dispatch(setUser(res.data.user));
      fetchStats();
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.error || "Extension failed.";
      setToast({
        isVisible: true,
        message: msg,
        type: "error"
      });
    } finally {
      setExtendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-[#c4c0ff] animate-spin" />
        <p className="text-xs text-[#c4c7c8]/60">Loading pricing plans...</p>
      </div>
    );
  }

  const isPro = stats?.plan === "pro" && stats?.is_premium_active;
  const pointsProgress = Math.min(100, Math.round(((stats?.points || 0) / (stats?.points_needed_for_premium || 100)) * 100));

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

  return (
    <div className="relative space-y-8 overflow-hidden py-4">
      {toast.isVisible && (
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}

      {/* Background Soft Purple/Lavender Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* Section Header */}
      <div className="relative text-center max-w-xl mx-auto space-y-2">
        <span className="inline-block text-[11px] font-semibold tracking-wider text-[#c4c0ff] px-3 py-1 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/20">
          Pricing Plans
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#e5e2e1]">
          Choose the right plan for your business
        </h1>
        <p className="text-xs text-[#c4c7c8]/70 max-w-md mx-auto leading-relaxed">
          Choose an affordable plan packed with automation features for engaging your audience, creating customer loyalty, and driving Instagram sales.
        </p>

        {formattedExpiryDate && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-md bg-[#1c1b1b] border border-[#2a2a2a] text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#c4c0ff]" />
            <span className="text-[#c4c7c8]/70">{isPro ? "Subscription Expiry:" : "Trial Expiry Date:"}</span>
            <span className="font-semibold text-white">{formattedExpiryDate}</span>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="relative max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Free Trial / Starter Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#2a2a2a] bg-[#1c1b1b] p-6 shadow-xl relative overflow-hidden group hover:border-[#444748] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c4c0ff] tracking-wide uppercase">
                Free Trial
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                14 Days Included
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">₹0</span>
              <span className="text-xs text-[#c4c7c8]/60">/ 14 days</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#c4c7c8]/70">
              Perfect for exploring Instagram message automations and launching your first storefront catalog.
            </p>

            {/* Features list */}
            <ul className="mt-6 space-y-3 text-xs text-[#c4c7c8]">
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>1 Instagram Account connected</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Basic Keyword DMs &amp; Story Reply Triggers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Shoppable Product Catalog (5 items)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Community Support &amp; Tutorials</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-[#2a2a2a]">
            {!isPro ? (
              stats?.has_extended_trial ? (
                <div className="w-full py-2.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#c4c7c8]/60 text-center font-medium">
                  {stats?.trial_days_left > 0 ? `Trial Active (${stats?.trial_days_left}d left)` : "Trial Expired"}
                </div>
              ) : (
                <button
                  onClick={handleExtendTrial}
                  disabled={extendLoading}
                  className="w-full rounded-md bg-[#2a2a2a] hover:bg-[#353535] border border-[#444748] py-2.5 text-xs font-semibold text-[#e5e2e1] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {extendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Extend Trial (7 Days Free)</span>
                </button>
              )
            ) : (
              <div className="w-full py-2.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-zinc-400 text-center font-medium">
                Included with Account
              </div>
            )}
          </div>
        </div>

        {/* Creator Pro Card (Popular/Featured) */}
        <div className="flex flex-col justify-between rounded-xl border border-[#c4c0ff]/40 bg-[#1c1b1b] p-6 shadow-2xl relative overflow-hidden group hover:border-[#c4c0ff]/60 transition-all">
          {/* Featured Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c4c0ff] via-[#e3dfff] to-[#c4c0ff]" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c4c0ff] tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creator Pro</span>
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 text-[#c4c0ff]">
                Most Popular
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">₹{stats?.paid_plan_price || 499}</span>
              <span className="text-xs text-[#c4c7c8]/60">/ month</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#c4c7c8]/70">
              Unlimited automation operating system for creators, stores, and brands scaling Instagram sales.
            </p>

            {/* Features list */}
            <ul className="mt-6 space-y-3 text-xs text-[#c4c7c8]">
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-white">Unlimited Instagram Accounts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Unlimited DMs, AI Chatbots &amp; Story Loops</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Full Shoppable Product Catalogs &amp; Orders</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Priority Dedicated 24/7 Support</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 flex items-center justify-center text-[#c4c0ff] shrink-0">
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                </div>
                <span>Custom Referral Code &amp; Points Earning</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-4 border-t border-[#2a2a2a] space-y-2">
            {isPro ? (
              <div className="golden-glow w-full py-3 px-4 rounded-md border border-amber-300/40 text-[#131313] font-semibold text-xs flex flex-col items-center justify-center gap-1 tracking-wide shadow-[0_0_15px_rgba(255,191,0,0.3)]">
                <div className="flex items-center gap-1.5 z-10 font-bold [text-shadow:0_1px_0_rgba(255,245,190,0.6)]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Subscription Active</span>
                </div>
                {formattedExpiryDate && (
                  <span className="text-[11px] text-[#131313]/90 normal-case tracking-normal font-medium z-10 [text-shadow:0_1px_0_rgba(255,245,190,0.5)]">
                    Expiry Date: <strong className="font-bold text-[#131313]">{formattedExpiryDate}</strong>
                  </span>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={payLoading}
                  className="w-full bg-white hover:bg-[#eaeaea] text-black py-2.5 rounded-md text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 shadow-md"
                >
                  {payLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  <span>Get Started Today (Secure Checkout)</span>
                </button>

                <button
                  onClick={handleRedeemPoints}
                  disabled={redeemLoading || stats?.points < stats?.points_needed_for_premium}
                  className="w-full bg-[#20201f] border border-[#444748] hover:bg-[#2a2a2a] text-[#e5e2e1] py-2 rounded-md text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5 text-[#c4c0ff]" />}
                  <span>Redeem {stats?.points_needed_for_premium || 100} Referral Points</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Referral & Discount Banner (Matching Bottom Card in Template) */}
      <div className="relative max-w-4xl mx-auto rounded-xl border border-[#444748] bg-[#1c1b1b] p-5 md:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold text-[#c4c0ff] tracking-wide flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              <span>Referral Points Balance</span>
            </span>
            <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              {stats?.points || 0} / {stats?.points_needed_for_premium || 100} pts
            </span>
          </div>

          <p className="text-xs text-[#c4c7c8]/70 max-w-xl leading-relaxed">
            Invite friends &amp; creators to AnyDM. Earn 20 points for every referral signup and claim free Creator Pro access without paying!
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-[#131313] h-2 rounded-full overflow-hidden border border-[#444748] p-[1px] mt-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c4c0ff] to-[#e3dfff] transition-all duration-300"
              style={{ width: `${pointsProgress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/refer")}
          className="shrink-0 rounded-md bg-[#2a2a2a] hover:bg-[#353535] border border-[#444748] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <span>Earn More Points</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}