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
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
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

        {/* Right Column - Warnings & Information */}
        <div className="lg:col-span-1 flex flex-col gap-6">
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

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}
