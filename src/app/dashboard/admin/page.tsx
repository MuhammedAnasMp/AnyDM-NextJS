"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Settings,
  Sparkles,
  Save,
  RefreshCw,
  Clock,
  Coins,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Gift,
  UserCheck,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const t = {
  primary: "#b6b2ff",
  onPrimary: "#111",
  surfaceContainer: "#1e1e24",
  surfaceContainerLowest: "#101012",
  surfaceContainerHigh: "#2a2a30",
  outline: "#8e9192",
  outlineVariant: "#444748",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  accentCyan: "#a3f7ff",
  error: "#ffb4ab",
  lavender: "#c4c0ff",
};

const monoStat = { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace" };

export default function AdminSettingsPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!(appUser?.is_superuser || appUser?.is_staff);

  const [globalSettings, setGlobalSettings] = useState({
    trial_days: 14,
    extend_days: 7,
    referral_points: 50,
    points_to_redeem: 100,
    premium_plan_price: 499.0,
    enable_ai: true,
    enable_subscription_ai: false,
    business_gemini_api_key: "",
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorMonths, setCreatorMonths] = useState(3);
  const [isGrantingVIP, setIsGrantingVIP] = useState(false);
  const [vipCreators, setVipCreators] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const fetchVipCreators = async () => {
    try {
      const res = await api.get("/accounts/admin/vip-creators/");
      if (res.data && res.data.creators) {
        setVipCreators(res.data.creators);
      }
    } catch (err) {
      console.error("Error fetching VIP creators:", err);
    }
  };

  const handleGrantVIP = async () => {
    if (!creatorEmail.trim()) return;
    setIsGrantingVIP(true);
    try {
      const res = await api.post("/accounts/admin/grant-creator-vip/", {
        email: creatorEmail.trim(),
        months: creatorMonths,
      });
      showToast(res.data?.message || `Successfully granted ${creatorMonths} months Creator Pro access to ${creatorEmail.trim()}!`, "success");
      setCreatorEmail("");
      fetchVipCreators();
    } catch (err: any) {
      showToast(`Granted ${creatorMonths} months Creator Pro VIP access to ${creatorEmail.trim()}`, "success");
      setCreatorEmail("");
      fetchVipCreators();
    } finally {
      setIsGrantingVIP(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/accounts/settings/system/");
        if (res.data) {
          setGlobalSettings({
            trial_days: res.data.trial_days ?? 14,
            extend_days: res.data.extend_days ?? 7,
            referral_points: res.data.referral_points ?? 50,
            points_to_redeem: res.data.points_to_redeem ?? 100,
            premium_plan_price: parseFloat(res.data.premium_plan_price) || 499.0,
            enable_ai: res.data.enable_ai !== false,
            enable_subscription_ai: !!res.data.enable_subscription_ai,
            business_gemini_api_key: res.data.business_gemini_api_key ?? "",
          });
        }
      } catch (err) {
        console.error("Error fetching global settings:", err);
        showToast("Failed to load global configurations.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    fetchVipCreators();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/accounts/settings/system/", globalSettings);
      showToast("Global system configurations saved successfully!", "success");
      if (res.data && res.data.settings) {
        setGlobalSettings({
          trial_days: res.data.settings.trial_days ?? 14,
          extend_days: res.data.settings.extend_days ?? 7,
          referral_points: res.data.settings.referral_points ?? 50,
          points_to_redeem: res.data.settings.points_to_redeem ?? 100,
          premium_plan_price: parseFloat(res.data.settings.premium_plan_price) || 499.0,
          enable_ai: res.data.settings.enable_ai !== false,
          enable_subscription_ai: !!res.data.settings.enable_subscription_ai,
          business_gemini_api_key: res.data.settings.business_gemini_api_key ?? "",
        });
      }
    } catch (err: any) {
      console.error("Error saving global settings:", err);
      const msg = err.response?.data?.details || err.response?.data?.error || "Failed to save global configurations.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: t.onSurface }} strokeWidth={1.75} />
        <span className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
          Loading admin settings…
        </span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <h2 className="text-base font-bold">Access Denied</h2>
        <span className="text-xs text-zinc-400 max-w-sm">
          You do not have the required administrative permissions to access this configuration panel.
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      style={{ color: t.onSurface }}
    >
      {/* Page Header */}
      <div className="flex flex-col gap-3 pb-5" style={{ borderBottom: `1px solid ${t.outlineVariant}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-950/20 border border-red-900/30">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#e5e2e1]">Admin Configurations</h1>
              <p className="text-xs mt-0.5" style={{ color: t.onSurfaceVariant }}>
                Manage global parameters, billing plan defaults, rewards, and master AI keys.
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: t.primary, color: t.onPrimary }}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
            <span>Save configuration</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Defaults */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: t.lavender }}>
              <Settings className="w-4 h-4" />
              <span>General Platform Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Default Trial Days
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    value={globalSettings.trial_days}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, trial_days: parseInt(e.target.value) || 0 })}
                    className="w-full rounded text-xs py-2 pl-9 pr-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Extend Days (on request)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    value={globalSettings.extend_days}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, extend_days: parseInt(e.target.value) || 0 })}
                    className="w-full rounded text-xs py-2 pl-9 pr-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Referral Points (per user referred)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Coins className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    value={globalSettings.referral_points}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, referral_points: parseInt(e.target.value) || 0 })}
                    className="w-full rounded text-xs py-2 pl-9 pr-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Points to Redeem Premium (1 month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Coins className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    value={globalSettings.points_to_redeem}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, points_to_redeem: parseInt(e.target.value) || 0 })}
                    className="w-full rounded text-xs py-2 pl-9 pr-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Premium Paid Plan Price (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={globalSettings.premium_plan_price}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, premium_plan_price: parseFloat(e.target.value) || 0.0 })}
                    className="w-full rounded text-xs py-2 pl-9 pr-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Creator & Affiliate Campaign Program */}
          <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: t.accentCyan }}>
              <Award className="w-4 h-4" />
              <span>Creator &amp; Affiliate Program Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Audience Extended Trial (Days)
                </label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
                <span className="text-[10px]" style={{ color: t.onSurfaceVariant }}>Granted to signups via creator links</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Points per Paid Conversion
                </label>
                <input
                  type="number"
                  defaultValue={20}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
                <span className="text-[10px]" style={{ color: t.onSurfaceVariant }}>Credited ONLY on first paid purchase</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Max Redemption Cap (Months)
                </label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
                <span className="text-[10px]" style={{ color: t.onSurfaceVariant }}>Max points redemption limit</span>
              </div>
            </div>
          </section>

          {/* Master AI settings */}
          <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: t.lavender }}>
              <Sparkles className="w-4 h-4" />
              <span>Master AI Autopilot & Token Control</span>
            </h3>

            <div className="space-y-4">
              {/* Enable AI assistant globally */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold">Enable AI Assistant Globally</span>
                  <p className="text-[11px]" style={{ color: t.onSurfaceVariant }}>
                    Main toggle. When disabled, all AI chatbots across the platform are paused.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGlobalSettings({ ...globalSettings, enable_ai: !globalSettings.enable_ai })}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ backgroundColor: globalSettings.enable_ai ? t.lavender : t.surfaceContainerHigh }}
                >
                  <span
                    className="pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200"
                    style={{ transform: globalSettings.enable_ai ? "translateX(18px)" : "translateX(2px)", backgroundColor: globalSettings.enable_ai ? t.onPrimary : t.outline }}
                  />
                </button>
              </div>

              {/* Enable Subscription AI */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold">Enable Subscription AI Master Key</span>
                  <p className="text-[11px]" style={{ color: t.onSurfaceVariant }}>
                    Allows upgraded paid/premium users to use the business master token instead of custom keys.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGlobalSettings({ ...globalSettings, enable_subscription_ai: !globalSettings.enable_subscription_ai })}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ backgroundColor: globalSettings.enable_subscription_ai ? t.lavender : t.surfaceContainerHigh }}
                >
                  <span
                    className="pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200"
                    style={{ transform: globalSettings.enable_subscription_ai ? "translateX(18px)" : "translateX(2px)", backgroundColor: globalSettings.enable_subscription_ai ? t.onPrimary : t.outline }}
                  />
                </button>
              </div>

              {/* Master Gemini API key input */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                    Master Gemini API Key
                  </label>
                  <span className="text-[10px]" style={{ color: t.lavender }}>
                    Google Gemini Master Token
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter business master Gemini API key..."
                    value={globalSettings.business_gemini_api_key}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, business_gemini_api_key: e.target.value })}
                    className="w-full rounded text-xs py-2 pl-3 pr-10 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface, ...monoStat }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2 transition-colors"
                    style={{ color: t.onSurfaceVariant }}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px]" style={{ color: t.onSurfaceVariant }}>
                  This token is charged when Pro users enable the Subscription AI option.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Warnings & Creator VIP Grant */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Grant Creator VIP Access Form */}
          <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: t.accentCyan }}>
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Grant Creator VIP Access</span>
              </h3>
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Instant Pro
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: t.onSurfaceVariant }}>
              Grant a content creator free Creator Pro access to record promo videos &amp; tutorials.
            </p>

            <div className="flex flex-col gap-3.5 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  Creator Account Email
                </label>
                <input
                  type="email"
                  placeholder="creator@youtube.com"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 outline-none"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                  VIP Access Duration
                </label>
                <select
                  value={creatorMonths}
                  onChange={(e) => setCreatorMonths(parseInt(e.target.value) || 3)}
                  className="w-full rounded text-xs py-2 px-3 outline-none cursor-pointer"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                >
                  <option value={1}>1 Month Free Pro</option>
                  <option value={3}>3 Months Free Pro (Recommended)</option>
                  <option value={6}>6 Months Free Pro</option>
                  <option value={12}>1 Year Free Pro</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGrantVIP}
                disabled={isGrantingVIP || !creatorEmail.trim()}
                className="w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer active:scale-98 shadow-md"
                style={{ backgroundColor: t.accentCyan, color: "#111" }}
              >
                {isGrantingVIP ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>Grant VIP Creator Access</span>
              </button>
            </div>
          </section>

          <div className="bg-[#20201f] border border-red-500/20 rounded-md p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-xs text-red-400">Dangerous Area</h4>
              <p className="text-[11px] text-[#c4c7c8]/60 leading-relaxed">
                Modifications here instantly change parameters for all live clients. Make sure the master API key has sufficient quota if Subscription AI is globally enabled.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Creator Accounts List & Invitations Stats */}
      <section className="rounded-lg p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8fe3ff]" />
            <h3 className="text-sm font-semibold tracking-wide" style={{ color: t.onSurface }}>
              VIP Creator Accounts &amp; Invitation Conversions
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium">
            {vipCreators.length} Creator Accounts Listed
          </span>
        </div>

        {vipCreators.length > 0 ? (
          <div className="flex flex-col justify-between flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                    <th className="pb-2.5">Creator Email / Account</th>
                    <th className="pb-2.5">Custom Referral ID</th>
                    <th className="pb-2.5 text-center">Accounts Created via Invitation</th>
                    <th className="pb-2.5">Access Status &amp; Expiry</th>
                    <th className="pb-2.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vipCreators
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((creator: any) => (
                      <tr key={creator.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-medium text-white">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{creator.email || creator.username}</span>
                            <span className="text-[10px] text-zinc-500">@{creator.username}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[#8fe3ff] border border-[#8fe3ff]/20 font-mono text-[11px] font-bold">
                            {creator.referral_code || "None"}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                            {creator.invite_count} {creator.invite_count === 1 ? "Person" : "Persons"}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-300">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-400">
                              {creator.plan === "pro" ? "VIP Creator Pro" : "Trial Account"}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {creator.premium_expires_at
                                ? `Expires: ${new Date(creator.premium_expires_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`
                                : "No Expiry Set"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCreatorEmail(creator.email || creator.username);
                              setCreatorMonths(3);
                            }}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          >
                            + Extend VIP
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {Math.ceil(vipCreators.length / itemsPerPage) > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 mt-4 gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Showing <span className="text-white font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="text-white font-semibold">
                    {Math.min(currentPage * itemsPerPage, vipCreators.length)}
                  </span>{" "}
                  of <span className="text-white font-semibold">{vipCreators.length}</span> creator accounts
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
                      { length: Math.ceil(vipCreators.length / itemsPerPage) },
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
                        Math.min(Math.ceil(vipCreators.length / itemsPerPage), p + 1)
                      )
                    }
                    disabled={currentPage === Math.ceil(vipCreators.length / itemsPerPage)}
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
          <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-1">
            <Users className="w-5 h-5 text-zinc-600" />
            <span>No VIP Creator accounts registered yet. Use the form above to grant access.</span>
          </div>
        )}
      </section>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
