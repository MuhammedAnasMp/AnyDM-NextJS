"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Brain,
  Settings2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Truck,
  Phone,
  Store,
  Layers,
  BookOpen,
  Bot,
  RefreshCw,
} from "lucide-react";
import Toast from "@/components/Toast";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

/**
 * Design tokens — Glass Monochrome
 * Mirrors design-system.yaml. Move to tailwind.config theme.extend.colors
 * once adopted app-wide.
 */
const t = {
  surfaceContainerLowest: "#0e0e0e",
  surfaceContainerLow: "#1c1b1b",
  surfaceContainer: "#20201f",
  surfaceContainerHigh: "#2a2a2a",
  onSurface: "#e5e2e1",
  onSurfaceVariant: "#c4c7c8",
  outline: "#8e9192",
  outlineVariant: "#444748",
  primary: "#ffffff",
  onPrimary: "#2f3131",
  accentCyan: "#8fe3ff",
  lavender: "#c4c0ff",
  success: "#34d399",
  error: "#ffb4ab",
};

const monoStat = { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace" };

export default function AISettingsPage() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts);

  const activeAccount = instagramAccounts.find((a: any) => a.id === appUser?.active_instagram_account_id) || instagramAccounts[0];
  const activeAccountId = activeAccount?.id ?? null;

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAiModeOn, setIsAiModeOn] = useState(false);
  const [useBusinessToken, setUseBusinessToken] = useState(false);
  const [enableSubscriptionAi, setEnableSubscriptionAi] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [responseStyle, setResponseStyle] = useState("Friendly");
  const [maxReplyLength, setMaxReplyLength] = useState(150);
  const [maxReplyCount, setMaxReplyCount] = useState(50);
  const [lastError, setLastError] = useState("");
  const [enableAi, setEnableAi] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [productsAndServices, setProductsAndServices] = useState("");

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [newQuickReply, setNewQuickReply] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" as "success" | "error" | "info" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const populateForm = (data: any) => {
    setApiKey(data.api_key || "");
    setIsAiModeOn(data.is_ai_mode_on || false);
    setUseBusinessToken(data.use_business_token || false);
    setEnableSubscriptionAi(data.enable_subscription_ai || false);
    setCustomInstructions(data.custom_instructions || "");
    setResponseStyle(data.response_style || "Friendly");
    setMaxReplyLength(data.max_reply_length || 150);
    setMaxReplyCount(data.max_reply_count || 50);
    setBusinessName(data.business_name || "");
    setBusinessLocation(data.business_location || "");
    setWorkingHours(data.working_hours || "");
    setDeliveryTime(data.delivery_time || "");
    setContactDetails(data.contact_details || "");
    setProductsAndServices(data.products_and_services || "");
    setFaqs(data.faqs || []);
    setQuickReplies(data.quick_replies || []);
    setLastError(data.last_error || "");
  };

  const fetchSettings = useCallback(async (accountId: number | null) => {
    if (!accountId) return;
    setIsLoading(true);
    try {
      try {
        const sysRes = await api.get("/accounts/settings/system/");
        if (sysRes.data && sysRes.data.enable_ai !== undefined) {
          setEnableAi(sysRes.data.enable_ai);
          if (!sysRes.data.enable_ai) {
            setIsLoading(false);
            return;
          }
        }
      } catch (sysErr) {
        console.error("Error loading system settings in AI page:", sysErr);
      }

      const res = await api.get(`/crm/ai-settings/?account_id=${accountId}`);
      if (res.data) {
        populateForm(res.data);
      }
    } catch (err) {
      console.error("Error fetching AI settings:", err);
      showToast("Couldn't load the AI configuration.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings(activeAccountId);
  }, [activeAccountId, fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/crm/ai-settings/", {
        ...(activeAccountId ? { account_id: activeAccountId } : {}),
        api_key: apiKey,
        is_ai_mode_on: isAiModeOn,
        use_business_token: useBusinessToken,
        custom_instructions: customInstructions,
        response_style: responseStyle,
        max_reply_length: maxReplyLength,
        max_reply_count: maxReplyCount,
        business_name: businessName,
        business_location: businessLocation,
        working_hours: workingHours,
        delivery_time: deliveryTime,
        contact_details: contactDetails,
        products_and_services: productsAndServices,
        faqs,
        quick_replies: quickReplies,
      });
      setIsAiModeOn(res.data.is_ai_mode_on);
      setLastError(res.data.last_error || "");
      showToast("AI assistant settings saved.", "success");
    } catch (err: any) {
      console.error("Error saving AI settings:", err);
      const errMsg = err.response?.data?.error || "Couldn't save the AI configuration.";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      showToast("Enter both a question and an answer.", "error");
      return;
    }
    setFaqs([...faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ("");
    setNewFaqA("");
    showToast("FAQ added.", "success");
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
    showToast("FAQ removed.", "info");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: t.onSurface }} strokeWidth={1.75} />
        <span className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
          Loading configuration…
        </span>
      </div>
    );
  }

  if (!enableAi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <AlertCircle className="w-8 h-8 text-zinc-500" style={{ color: t.error }} />
        <span className="text-sm font-medium text-zinc-400">
          AI assistant service is currently unavailable.
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
      {/* Page header */}
      <div className="flex flex-col gap-3 pb-5" style={{ borderBottom: `1px solid ${t.outlineVariant}` }}>
        <div className="flex items-center justify-between">
          <div>

            <p className="text-xs mt-1" style={{ color: t.onSurfaceVariant }}>
              Configure your automated customer support agent, connect its knowledge, and shape how it replies.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-md font-medium text-xs flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: t.primary, color: t.onPrimary }}
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
            <span>Save changes</span>
          </button>
        </div>

        {/* Active account context */}

      </div>

      {/* Error banner */}
      {lastError && (
        <div
          className="p-4 rounded-md flex items-start gap-3 text-xs"
          style={{ backgroundColor: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.2)", color: t.error }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="space-y-1">
            <p className="font-medium">AI autopilot deactivated (API error)</p>
            <p className="text-[11px] opacity-90" style={monoStat}>
              {lastError}
            </p>
            <p className="text-[11px] pt-1" style={{ color: t.onSurfaceVariant }}>
              To reactivate, add a valid key with sufficient quota below and save your changes.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* AI access & activation */}
          <section className="rounded-lg p-4 md:p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <SectionHeading icon={Settings2} label="AI access & activation" />

            <div className="space-y-4">
              {(!enableSubscriptionAi || !useBusinessToken) && (
                <div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                      Gemini API token
                    </label>
                    <span className="text-[11px]" style={{ color: t.lavender }}>
                      Google Gemini keys only
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your Gemini API key (e.g., AIzaSy…)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full rounded text-xs py-2 pl-3 pr-10 focus:outline-none transition-colors"
                      style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface, ...monoStat }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2 transition-colors"
                      style={{ color: t.onSurfaceVariant }}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-[11px]" style={{ color: t.onSurfaceVariant }}>
                      Used to run the support AI. Turns off automatically if the key is invalid or over quota.
                    </p>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] hover:underline font-medium shrink-0 ml-2"
                      style={{ color: t.lavender }}
                    >
                      Get a Gemini key →
                    </a>
                  </div>
                </div>
              )}

              {enableSubscriptionAi && (
                <div className="space-y-2 pt-4" style={{ borderTop: `1px solid ${t.outlineVariant}` }}>
                  <label className="text-xs font-medium block" style={{ color: t.onSurfaceVariant }}>
                    AI Subscription Plan
                  </label>
                  <p className="text-[11px]" style={{ color: t.onSurfaceVariant }}>
                    Choose whether to use your own Gemini API key or use the business's master token.
                  </p>
                  
                  {appUser?.plan === 'pro' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUseBusinessToken(false)}
                        className={cn(
                          "py-2 px-3 rounded-md text-xs font-medium text-center transition-colors cursor-pointer border",
                          !useBusinessToken
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white border-zinc-700 hover:border-zinc-500"
                        )}
                      >
                        Use My Own Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseBusinessToken(true)}
                        className={cn(
                          "py-2 px-3 rounded-md text-xs font-medium text-center transition-colors cursor-pointer border",
                          useBusinessToken
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white border-zinc-700 hover:border-zinc-500"
                        )}
                      >
                        Use Business Token
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs p-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      🔒 <strong>Business Token</strong> option is only available for paid (Pro) accounts. Please upgrade your subscription to unlock this feature.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${t.outlineVariant}` }}>
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: t.accentCyan }} strokeWidth={1.75} />
                    <span>Enable AI autopilot mode</span>
                  </span>
                  <p className="text-[11px] max-w-sm" style={{ color: t.onSurfaceVariant }}>
                    When on, the AI manages support conversations automatically using the settings below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !isAiModeOn;
                    setIsAiModeOn(nextVal);
                    try {
                      await api.post("/crm/ai-settings/toggle-global/", {
                        is_ai_mode_on: nextVal,
                        ...(activeAccountId ? { account_id: activeAccountId } : {}),
                      });
                      showToast(`AI autopilot mode turned ${nextVal ? "on" : "off"}.`, "success");
                    } catch (err) {
                      console.error("Failed to toggle global AI mode:", err);
                      showToast("Couldn't update the AI mode.", "error");
                    }
                  }}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ backgroundColor: isAiModeOn ? t.lavender : t.surfaceContainerHigh }}
                >
                  <span
                    className="pointer-events-none inline-block h-4 w-4 mt-0.5 transform rounded-full transition duration-200"
                    style={{ transform: isAiModeOn ? "translateX(18px)" : "translateX(2px)", backgroundColor: isAiModeOn ? t.onPrimary : t.outline }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Agent personality */}
          <section className="rounded-lg p-4 md:p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <SectionHeading icon={Brain} label="AI agent personality" />

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: t.onSurfaceVariant }}>
                  Tone of voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Friendly", "Professional", "Casual", "Formal"].map((style) => {
                    const active = responseStyle === style;
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setResponseStyle(style)}
                        className="py-2 px-3 rounded-md text-xs font-medium text-center transition-colors cursor-pointer"
                        style={{
                          backgroundColor: active ? t.primary : t.surfaceContainerLowest,
                          border: active ? `1px solid ${t.primary}` : `1px solid ${t.outlineVariant}`,
                          color: active ? t.onPrimary : t.onSurfaceVariant,
                        }}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                    Custom instructions
                  </label>
                  <span className="text-[11px]" style={{ color: t.onSurfaceVariant, ...monoStat }}>
                    {customInstructions.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Define how the AI agent should act — rules to follow, greeting style, and so on."
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" style={{ borderTop: `1px solid ${t.outlineVariant}` }}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                      Max word limit
                    </label>
                    <span className="text-xs font-bold" style={monoStat}>
                      {maxReplyLength} words
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={maxReplyLength}
                    onChange={(e) => setMaxReplyLength(parseInt(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer accent-white"
                    style={{ backgroundColor: t.surfaceContainerHigh }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium" style={{ color: t.onSurfaceVariant }}>
                      Max replies / chat
                    </label>
                    <span className="text-xs font-bold" style={monoStat}>
                      {maxReplyCount} msgs
                    </span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={maxReplyCount}
                    onChange={(e) => setMaxReplyCount(parseInt(e.target.value) || 20)}
                    className="w-full rounded text-xs py-1.5 px-3 focus:outline-none transition-colors"
                    style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface, ...monoStat }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FAQ builder */}
          <section className="rounded-lg p-4 md:p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <SectionHeading icon={BookOpen} label="Interactive FAQs" />
            <p className="text-[11px] -mt-3" style={{ color: t.onSurfaceVariant }}>
              Add common customer questions and exact answers. The AI prioritizes these over improvising.
            </p>

            <div className="space-y-2.5 p-3 rounded-md" style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}` }}>
              <input
                type="text"
                placeholder="Question (e.g., Do you offer refunds?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                style={{ backgroundColor: t.surfaceContainerLow, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
              />
              <textarea
                rows={2}
                placeholder="Answer (e.g., Yes, we offer full refunds within 14 days of purchase.)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                style={{ backgroundColor: t.surfaceContainerLow, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="text-xs font-medium py-1.5 px-3.5 rounded-md flex items-center justify-center gap-1.5 ml-auto transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: t.primary, color: t.onPrimary }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Add FAQ</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: t.outline }}>
                No FAQs yet. Add one above to give the AI something to reference.
              </p>
            ) : (
              <div className="max-h-[250px] overflow-y-auto pr-1">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="py-3 flex items-start justify-between gap-3"
                    style={index !== faqs.length - 1 ? { borderBottom: `1px solid ${t.outlineVariant}` } : undefined}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{faq.question}</p>
                      <p className="text-[11px]" style={{ color: t.onSurfaceVariant }}>
                        {faq.answer}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(index)}
                      className="p-1 rounded transition-colors cursor-pointer shrink-0 hover:bg-white/5"
                      style={{ color: t.onSurfaceVariant }}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Business profile */}
          <section className="rounded-lg p-4 md:p-5 space-y-4" style={{ backgroundColor: t.surfaceContainer }}>
            <SectionHeading icon={Store} label="Business profile" />
            <p className="text-[11px] -mt-3 leading-relaxed" style={{ color: t.onSurfaceVariant }}>
              Static store details the AI references to answer questions accurately.
            </p>

            <div className="space-y-3.5">
              <ProfileField icon={Store} label="Business name">
                <input
                  type="text"
                  placeholder="e.g., Serene Quartz Jewels"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>

              <ProfileField icon={Clock} label="Working hours">
                <input
                  type="text"
                  placeholder="e.g., Mon–Fri: 9am–6pm"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>

              <ProfileField icon={Truck} label="Delivery time">
                <input
                  type="text"
                  placeholder="e.g., 2–3 business days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>

              <ProfileField icon={Phone} label="Contact details">
                <textarea
                  rows={2}
                  placeholder="e.g., Email: support@serene.com, Phone: +123 456 789"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>

              <ProfileField icon={MapPin} label="Store location">
                <textarea
                  rows={2}
                  placeholder="e.g., 5th Avenue, Suite 400, New York, NY"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>

              <ProfileField icon={Layers} label="Products & services">
                <textarea
                  rows={3}
                  placeholder="Describe your products or services in enough detail for the AI to match specifics."
                  value={productsAndServices}
                  onChange={(e) => setProductsAndServices(e.target.value)}
                  className="w-full rounded text-xs py-2 px-3 focus:outline-none transition-colors"
                  style={{ backgroundColor: t.surfaceContainerLowest, border: `1px solid ${t.outlineVariant}`, color: t.onSurface }}
                />
              </ProfileField>
            </div>
          </section>

          {/* Safety note */}
          <div className="p-4 rounded-md flex items-start gap-3" style={{ border: `1px solid ${t.outlineVariant}` }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: t.onSurfaceVariant }} strokeWidth={1.75} />
            <div>
              <h4 className="text-xs font-medium mb-1">Global system safety rules</h4>
              <p className="text-[11px] leading-relaxed" style={{ color: t.onSurfaceVariant }}>
                The core prompt stops the AI agent from taking unauthorized actions, leaking credentials, or exposing private
                details — in line with company privacy guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </motion.div>
  );
}

/* ---------- Local presentational helpers ---------- */

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <h3 className="text-[13px] font-medium tracking-[0.01em] flex items-center gap-2">
      <Icon className="w-4 h-4" style={{ color: t.onSurfaceVariant }} strokeWidth={1.75} />
      <span>{label}</span>
    </h3>
  );
}

function ProfileField({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: t.onSurfaceVariant }}>
        <Icon className="w-3.5 h-3.5" style={{ color: t.lavender }} strokeWidth={1.75} />
        <span>{label}</span>
      </label>
      {children}
    </div>
  );
}