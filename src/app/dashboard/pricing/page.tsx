"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import api from "@/lib/services/api.service";
import { setUser } from "@/store/slices/authSlice";
import { Check, CreditCard, Sparkles, Star, Zap, Gift, RefreshCw, Loader2 } from "lucide-react";
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

  const isPro = stats?.plan === "pro";
  const pointsProgress = Math.min(100, Math.round(((stats?.points || 0) / (stats?.points_needed_for_premium || 100)) * 100));

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

      {/* Header (Dense) */}
      <div className="border-b border-[#444748] pb-4 space-y-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#e5e2e1]">
          Subscription <span className="text-[#c4c0ff]">&amp; Billing</span>
        </h1>
        <p className="text-xs text-[#c4c7c8] max-w-2xl leading-relaxed">
          Manage your subscription plans, claim accumulated referral points, or configure Instagram store trial timelines.
        </p>
      </div>

      {/* Dense Grid containing the pricing blocks. Configured with lg:grid-cols-12 to comfortably align beside a persistent side-bar. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* Core Benefits Pane */}
        <div className="lg:col-span-7 bg-[#1c1b1b] border border-[#444748] rounded-[6px] p-4 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c4c7c8]">Included Capabilities</h3>
              <p className="text-[11px] text-[#c4c7c8]/60 mt-0.5">
                Full operating system limits are unlocked instantly upon purchase or redemption.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="text-xs font-medium text-[#e5e2e1]">Unlimited Instagram Accounts</h5>
                  <p className="text-[10px] text-[#c4c7c8]/60 leading-normal">Configure rule matrices and story mentions across all your store profiles.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="text-xs font-medium text-[#e5e2e1]">Advanced Messaging Inbox</h5>
                  <p className="text-[10px] text-[#c4c7c8]/60 leading-normal">Full tracking over direct messages, customer databases, and conversion boards.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="text-xs font-medium text-[#e5e2e1]">Storefront Products &amp; Catalogs</h5>
                  <p className="text-[10px] text-[#c4c7c8]/60 leading-normal">Design visual shoppable lists, capture client orders, and custom-brand catalogs.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 flex items-center justify-center text-[#c4c0ff] shrink-0 mt-0.5">
                  <Check className="w-3 h-3" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="text-xs font-medium text-[#e5e2e1]">Auto-Responder Templates &amp; AI Triggers</h5>
                  <p className="text-[10px] text-[#c4c7c8]/60 leading-normal">Set spin-to-win game mechanics, automatic story reply loops, and message routers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trial / Extension Banner (Compact) */}
          {!isPro && (
            <div className="p-3 rounded-[4px] bg-[#20201f] border border-[#444748] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#e5e2e1]">
                  {stats?.trial_days_left > 0
                    ? `${stats?.trial_days_left} Days Remaining in Trial`
                    : "Trial Window Expired"}
                </div>
                <div className="text-[10px] text-[#c4c7c8]/60 leading-tight">
                  {stats?.has_extended_trial
                    ? "Your single-use 7-day trial extension has been utilized."
                    : "Request a one-time 7-day manual trial extension."}
                </div>
              </div>

              {!stats?.has_extended_trial && (
                <button
                  onClick={handleExtendTrial}
                  disabled={extendLoading}
                  className="bg-[#2a2a2a] border border-[#444748] hover:bg-[#353535] text-[#e5e2e1] text-[10px] font-semibold py-1.5 px-3 rounded-[4px] transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {extendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Extend Trial</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Purchase & Points Panel */}
        <div className="lg:col-span-5 bg-[#20201f] border border-[#444748] rounded-[6px] p-4 flex flex-col justify-between gap-5 relative overflow-hidden">
          {/* Subtle top accent strip for active visual distinction */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c4c0ff] to-transparent"></div>

          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-[#444748] pb-3">
              <div>
                <span className="bg-[#c4c0ff]/10 border border-[#c4c0ff]/20 text-[#c4c0ff] text-[9px] font-semibold uppercase px-2 py-0.5 rounded-[4px] tracking-wider">
                  Monthly Access
                </span>
                <h4 className="text-base font-bold text-[#e5e2e1] mt-2">Creator Pro</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white block">₹{stats?.paid_plan_price || 499}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#c4c7c8]/50 font-bold">Billing Cycle</span>
              </div>
            </div>

            <p className="text-xs text-[#c4c7c8]/80 leading-normal">
              Activate the operational automation system. No minimum commitment thresholds. Cancel at your discretion.
            </p>

            <hr className="border-[#444748]" />

            {/* Points Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#e5e2e1] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#8FE3FF]" />
                  <span>Referral Balance</span>
                </span>
                <span className="text-[#c4c7c8] font-mono text-[11px]">
                  {stats?.points || 0} / {stats?.points_needed_for_premium || 100} pts
                </span>
              </div>

              {/* Linear Dense Progress bar */}
              <div className="w-full bg-[#131313] h-2 rounded-[4px] overflow-hidden border border-[#444748] p-[1px]">
                <div
                  className="h-full rounded-[4px] bg-gradient-to-r from-[#8FE3FF] to-[#c4c0ff] transition-all duration-300"
                  style={{ width: `${pointsProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#c4c7c8]/40 leading-normal">
                Submit referral signups to earn immediate system points and redeem free monthly terms.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isPro ? (
              <div className="w-full py-2.5 rounded-[4px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 uppercase tracking-wide">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Subscription Active</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={payLoading}
                  className="w-full bg-white hover:bg-[#eaeaea] text-black py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {payLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  <span>Secure Checkout</span>
                </button>

                <button
                  onClick={handleRedeemPoints}
                  disabled={redeemLoading || stats?.points < stats?.points_needed_for_premium}
                  className="w-full bg-[#1c1b1b] border border-[#444748] hover:bg-[#2a2a2a] text-[#e5e2e1] py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5 text-[#8FE3FF]" />}
                  <span>Redeem {stats?.points_needed_for_premium || 100} Points</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}