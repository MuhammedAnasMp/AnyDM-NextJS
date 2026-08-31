"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Edit3,
  AlertCircle,
  Menu,
  Send,
  Calendar,
  UserCheck,
  X,
  LayoutGrid,
  List,
  Layers,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";
import api from "@/lib/services/api.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  rule_type: string;
  trigger_event: string;
  status: "active" | "disabled" | "completed";
  count: string;
  followers_gained?: number;
  keywords: string[];
  target_mode: string;
  target_media_ids: string[];
  actions: Array<{
    action_type: string;
    dm_format: string;
    messages: string[];
  }>;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  updated_at: string;
}

const formatDateDisplay = (isoStr?: string | null) => {
  if (!isoStr) return null;
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return null;
  }
};

const getTriggerDetails = (item: any) => {
  const isWelcomeFlow = item.name === "Welcome Message Flow";
  const isPersistentMenu = item.name === "Persistent Menu Flow";

  if (isWelcomeFlow) {
    return {
      icon: <HelpCircle className="w-4 h-4 text-[#c4c0ff]" />,
      label: "User Taps Options",
      desc: "Starts when a new user selects a preset question in your chat."
    };
  }
  if (isPersistentMenu) {
    return {
      icon: <Menu className="w-4 h-4 text-[#c4c0ff]" />,
      label: "User Opens Menu",
      desc: "Triggered from options in the persistent chat menu."
    };
  }
  if (item.rule_type === "product_inquiry_comment" || item.rule_type === "comment_automation") {
    const hasKeywords = item.keywords && item.keywords.length > 0;
    return {
      icon: <MessageSquare className="w-4 h-4 text-[#c4c0ff]" />,
      label: hasKeywords ? "Specific Comment" : "Any Comment",
      desc: hasKeywords
        ? `Comments containing: ${item.keywords.join(", ")}`
        : "Triggered by any comment on your post/reel."
    };
  }
  return {
    icon: <Send className="w-4 h-4 text-[#34d399]" />,
    label: "Direct Message",
    desc: "Triggered via direct message interaction."
  };
};

export default function AutomationsDashboard() {
  const appUser = useSelector((state: RootState) => state.auth.user);
  const activeAccountId = appUser?.active_instagram_account_id;
  const instagramAccounts = useSelector((state: RootState) => state.auth.instagramAccounts || []);

  const activeAccount = instagramAccounts.find(
    (acc: any) => acc.id === activeAccountId
  ) || instagramAccounts[0];

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("automation_view_mode");
      if (saved === "grid" || saved === "list") return saved;
    }
    return "grid";
  });

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("automation_view_mode", mode);
    }
  };

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAutomations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get("/automations/", {
        bypassCache: true
      } as any);
      if (Array.isArray(response.data)) {
        setAutomations(response.data);
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
      showToast("Failed to load automations. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [activeAccountId]);

  const handleToggle = async (id: string, currentStatus: "active" | "disabled" | "completed") => {
    setTogglingId(id);
    const nextEnabled = currentStatus !== "active";
    try {
      const response = await api.post(`/automations/${id}/toggle/`, { isEnabled: nextEnabled });
      if (response.data && response.data.success) {
        setAutomations(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, status: nextEnabled ? "active" : "disabled" };
          }
          return item;
        }));
        showToast(`Automation ${nextEnabled ? "activated" : "paused"}.`, "success");
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      showToast("Failed to update status. Please try again.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    setDeletingId(id);
    try {
      const response = await api.delete(`/automations/${id}/`);
      if (response.data && response.data.success) {
        setAutomations(prev => prev.filter(item => item.id !== id));
        showToast("Automation deleted successfully.", "success");
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      showToast("Failed to delete automation.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const totalTriggers = automations.reduce((sum, item) => sum + parseInt(item.count || "0", 10), 0);
  const activeCount = automations.filter(item => item.status === "active").length;
  const followersGainedTotal = automations.reduce((sum, item) => sum + (item.followers_gained || 0), 0);

  return (
    <div className="relative space-y-5 overflow-hidden text-[#e5e2e1] pb-20 w-full font-sans">
      {/* Background Soft Lavender Ambient Glow */}
      <div
        className="-z-100 pointer-events-none absolute left-1/2 top-[-50px] h-[320px] w-[600px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/15 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-md border text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ${toast.type === "success"
              ? "bg-[#10b981]/20 border-[#10b981]/40 text-[#34d399]"
              : toast.type === "error"
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-[#c4c0ff]/20 border-[#c4c0ff]/40 text-[#c4c0ff]"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1c1b1b] p-5 rounded-lg border border-[#2a2a2a] shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#e5e2e1]">
              Automations Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#c4c0ff] text-xs font-semibold">
              {activeAccount?.username ? `@${activeAccount.username}` : "Connected"}
            </span>
          </div>
          <p className="text-xs text-[#8e9192]">
            Manage automated DM replies, comment triggers, story mentions, and customer conversation flows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => fetchAutomations()}
            disabled={loading}
            className="p-2.5 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh automations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>

          <Link
            href="/dashboard/automations"
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded shadow-md flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Flow</span>
          </Link>
        </div>
      </div>

      {/* Account Paused Alert */}
      {activeAccount && activeAccount.is_enabled === false && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center gap-3 shadow-xl backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold">Automations are Currently Paused</p>
            <p className="text-zinc-300">
              The selected Instagram account <span className="font-semibold text-white">@{activeAccount.username}</span> is paused. No automations will run until you resume it in{" "}
              <Link href="/dashboard/settings/accounts" className="text-amber-400 underline hover:text-amber-300 font-semibold">
                Account Settings
              </Link>.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Total Executions</span>
            <Zap className="w-4 h-4 text-[#c4c0ff]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">{totalTriggers}</div>
          <p className="text-[11px] text-[#8e9192]">Automated workflow triggers</p>
        </div>

        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Active Workflows</span>
            <Play className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">{activeCount}</div>
          <p className="text-[11px] text-[#8e9192]">Live automated rules</p>
        </div>

        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Followers Gained</span>
            <UserCheck className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">+{followersGainedTotal}</div>
          <p className="text-[11px] text-[#8e9192]">From automated interactions</p>
        </div>

        <div className="p-4 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8e9192] text-xs font-semibold">
            <span>Configured Flows</span>
            <MessageSquare className="w-4 h-4 text-[#c4c0ff]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e2e1]">{automations.length}</div>
          <p className="text-[11px] text-[#8e9192]">Active rule templates</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 rounded-lg bg-[#1c1b1b] border border-[#2a2a2a] space-y-4 shadow-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-[#e5e2e1]">
              Configured Automations
            </h2>
            <span className="px-2 py-0.5 bg-[#20201f] border border-[#2a2a2a] rounded-md text-[10px] text-[#c4c0ff] font-semibold">
              {automations.length} Total
            </span>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center bg-[#101115] border border-[#2a2a2a] rounded-md p-0.5">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs",
                viewMode === "grid" ? "bg-[#20201f] text-white font-semibold" : "text-[#8e9192] hover:text-white"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs",
                viewMode === "list" ? "bg-[#20201f] text-white font-semibold" : "text-[#8e9192] hover:text-white"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Content Rendering */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8e9192] space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#c4c0ff]" />
            <p className="font-semibold text-[#e5e2e1]">Loading automation rule sets...</p>
          </div>
        ) : automations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-12 space-y-3 max-w-md mx-auto"
          >
            <div className="w-10 h-10 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center mx-auto text-[#c4c0ff]">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#e5e2e1]">No Automation Rules Created</h3>
              <p className="text-xs text-[#8e9192] leading-relaxed">
                Create comment triggers, story reply flows, or welcome menus to automatically interact with your customers.
              </p>
            </div>
            <Link
              href="/dashboard/automations"
              className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded shadow-md hover:bg-zinc-200 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Flow</span>
            </Link>
          </motion.div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
            <AnimatePresence>
              {automations.map((item) => {
                const isSpecialFlow = item.name === "Welcome Message Flow" || item.name === "Persistent Menu Flow";
                const trigger = getTriggerDetails(item);
                const isActive = item.status === "active";

                const now = new Date();
                const startDate = item.start_at ? new Date(item.start_at) : null;
                const endDate = item.end_at ? new Date(item.end_at) : null;
                const isEnded = (endDate && endDate < now) || item.status === "completed";
                const isNotStarted = startDate && startDate > now;

                const startFormatted = formatDateDisplay(item.start_at);
                const endFormatted = formatDateDisplay(item.end_at);

                if (viewMode === "list") {
                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedAutomation(item)}
                      className={`bg-[#101115] border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl transition-all cursor-pointer hover:border-[#444748] ${isEnded
                        ? "border-rose-500/30 bg-rose-500/5"
                        : isActive
                          ? "border-[#2a2a2a]"
                          : "border-[#2a2a2a]/60 opacity-75"
                        }`}
                    >
                      {/* Left Details */}
                      <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 md:mt-0 ${isEnded ? "bg-rose-500" : isActive ? "bg-[#34d399]" : "bg-zinc-500"}`} />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm text-[#e5e2e1] group-hover:text-white tracking-tight truncate">
                              {item.name}
                            </h3>
                            {isSpecialFlow && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[#c4c0ff]/30 bg-[#c4c0ff]/10 text-[#c4c0ff] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Special Flow
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#8e9192] flex-wrap">
                            <span className="flex items-center gap-1.5">
                              {trigger.icon}
                              <span className="text-[#e5e2e1] font-semibold">{trigger.label}</span>
                            </span>
                            <span>•</span>
                            <span>{item.actions.length} Action{item.actions.length === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Stats */}
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-[#8e9192]">
                            <strong className="text-white font-bold">{item.count || 0}</strong> runs
                          </span>
                          <span>•</span>
                          <span className="text-xs font-semibold text-[#34d399] flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#34d399]" />
                            +{item.followers_gained || 0} followers
                          </span>
                        </div>

                        {/* Date Tag */}
                        {isEnded ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400 hidden lg:inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            Ended
                          </span>
                        ) : isNotStarted ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 hidden lg:inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            Starts {startFormatted}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md border border-[#2a2a2a] bg-[#20201f] text-[#8e9192] hidden lg:inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8e9192]" />
                            Always Active
                          </span>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggle(item.id, item.status)}
                          className={cn(
                            "w-8 h-4.5 rounded-full p-0.5 transition-all relative flex items-center outline-none border cursor-pointer",
                            isActive ? "bg-white border-transparent" : "bg-[#20201f] border-[#2a2a2a]",
                            isSpecialFlow && "opacity-50 cursor-not-allowed"
                          )}
                          title={isActive ? "Pause Automation" : "Activate Automation"}
                        >
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-150 flex items-center justify-center",
                              isActive ? "translate-x-3.5 bg-zinc-950" : "translate-x-0 bg-[#8e9192]"
                            )}
                          >
                            {togglingId === item.id && (
                              <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            )}
                          </div>
                        </button>

                        <a
                          href={`/dashboard/automations?id=${item.id}&mode=edit`}
                          className="py-1 px-3 bg-[#20201f] hover:bg-white/10 border border-[#2a2a2a] hover:border-[#444748] rounded-md text-xs font-semibold text-[#e5e2e1] transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#c4c0ff]" />
                          <span>Configure</span>
                        </a>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer border border-[#2a2a2a] hover:border-rose-500/30"
                          title="Delete automation"
                        >
                          {deletingId === item.id ? (
                            <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedAutomation(item)}
                    className={`bg-[#101115] border rounded-lg flex flex-col justify-between shadow-xl overflow-hidden transition-all duration-200 cursor-pointer hover:border-[#444748] ${isEnded
                      ? "border-rose-500/30 bg-rose-500/5"
                      : isActive
                        ? "border-[#2a2a2a]"
                        : "border-[#2a2a2a]/60 opacity-75"
                      }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 pb-3 border-b border-[#2a2a2a] bg-[#1c1b1b]/50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-semibold text-sm text-[#e5e2e1] group-hover:text-white tracking-tight truncate leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#8e9192] flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${isEnded ? "bg-rose-500" : isActive ? "bg-[#34d399]" : "bg-zinc-500"}`} />
                              {isEnded ? <span className="text-rose-400 font-bold">Ended</span> : isActive ? "Active" : "Paused"}
                            </span>
                            <span>•</span>
                            <span className="text-[11px] font-semibold text-[#8e9192]">
                              {item.count || 0} runs
                            </span>
                            <span>•</span>
                            <span className="text-[11px] font-semibold text-[#34d399] flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-[#34d399]" />
                              +{item.followers_gained || 0} followers
                            </span>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(item.id, item.status);
                          }}
                          className={cn(
                            "w-8 h-4.5 rounded-full p-0.5 transition-all relative flex items-center outline-none border cursor-pointer shrink-0",
                            isActive ? "bg-white border-transparent" : "bg-[#20201f] border-[#2a2a2a]",
                            isSpecialFlow && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-150 flex items-center justify-center",
                              isActive ? "translate-x-3.5 bg-zinc-950" : "translate-x-0 bg-[#8e9192]"
                            )}
                          >
                            {togglingId === item.id && (
                              <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Special Flow / Date Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isSpecialFlow && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[#c4c0ff]/30 bg-[#c4c0ff]/10 text-[#c4c0ff] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Special Flow
                          </span>
                        )}

                        {isEnded ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            Ended {endFormatted ? `on ${endFormatted}` : ""}
                          </span>
                        ) : isNotStarted ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            Starts {startFormatted}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-[#2a2a2a] bg-[#20201f] text-[#8e9192] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8e9192]" />
                            Always Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#1c1b1b] border border-[#2a2a2a]">
                        <div className="p-1.5 rounded-md bg-[#20201f] border border-[#2a2a2a] shrink-0">
                          {trigger.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-[#e5e2e1]">{trigger.label}</h4>
                          <p className="text-[11px] text-[#8e9192] truncate mt-0.5">
                            {trigger.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#8e9192] pt-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Layers className="w-3.5 h-3.5 text-[#c4c0ff]" />
                          {item.actions.length} Action{item.actions.length === 1 ? "" : "s"}
                        </span>
                        <span className="text-[#c4c0ff] group-hover:underline font-semibold flex items-center gap-1 transition-colors">
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-[#1c1b1b]/60 border-t border-[#2a2a2a] flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`/dashboard/automations?id=${item.id}`}
                        className="flex-1 py-1.5 px-3 bg-[#20201f] hover:bg-white/10 border border-[#2a2a2a] hover:border-[#444748] rounded-md text-xs font-semibold text-[#e5e2e1] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#c4c0ff]" />
                        <span>Configure Flow</span>
                      </a>

                      <button
                        onClick={() => {
                          if (isSpecialFlow) {
                            const tabParam = item.name === "Welcome Message Flow" ? "icebreakers" : "persistent_menu";
                            window.location.href = `/dashboard/automations?welcome=${tabParam}`;
                            return;
                          }
                          handleDelete(item.id);
                        }}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-md bg-[#20201f] border border-[#2a2a2a] hover:bg-rose-500/10 hover:border-rose-500/30 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer"
                        title={isSpecialFlow ? "Configure Settings in Welcome Profile" : "Delete Automation"}
                      >
                        {deletingId === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Details Popup Modal */}
      <AnimatePresence>
        {selectedAutomation && (() => {
          const item = selectedAutomation;
          const trigger = getTriggerDetails(item);
          const isActive = item.status === "active";
          const now = new Date();
          const startDate = item.start_at ? new Date(item.start_at) : null;
          const endDate = item.end_at ? new Date(item.end_at) : null;
          const isEnded = (endDate && endDate < now) || item.status === "completed";
          const startFormatted = formatDateDisplay(item.start_at);
          const endFormatted = formatDateDisplay(item.end_at);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-2xl flex flex-col my-auto text-[#e5e2e1]"
              >
                {/* Modal Header */}
                <div className="p-4 px-5 border-b border-[#2a2a2a] flex items-center justify-between shrink-0 bg-[#1c1b1b]">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8e9192]">
                        <span className={`w-2 h-2 rounded-full ${isEnded ? "bg-rose-500" : isActive ? "bg-[#34d399]" : "bg-zinc-500"}`} />
                        {isEnded ? "Ended" : isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-white tracking-tight">{item.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="p-1.5 rounded-md bg-[#20201f] border border-[#2a2a2a] hover:bg-rose-500/10 hover:border-rose-500/30 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {/* Quick Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-3.5 space-y-1">
                      <span className="text-xs font-semibold text-[#8e9192]">Total Runs</span>
                      <div className="flex items-center gap-2 text-xl font-bold text-white">
                        <Zap className="w-4 h-4 text-[#c4c0ff]" />
                        <span>{item.count || 0}</span>
                      </div>
                    </div>
                    <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-3.5 space-y-1">
                      <span className="text-xs font-semibold text-[#8e9192]">Followers Gained</span>
                      <div className="flex items-center gap-2 text-xl font-bold text-[#34d399]">
                        <UserCheck className="w-4 h-4 text-[#34d399]" />
                        <span>+{item.followers_gained || 0}</span>
                      </div>
                    </div>
                    <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-3.5 space-y-1">
                      <span className="text-xs font-semibold text-[#8e9192]">Schedule</span>
                      <div className="text-xs font-semibold text-[#e5e2e1] truncate pt-0.5">
                        {startFormatted && endFormatted ? `${startFormatted} – ${endFormatted}` : startFormatted ? `From ${startFormatted}` : "Always Active"}
                      </div>
                    </div>
                  </div>

                  {/* Flow Diagram */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8e9192]">
                      <span>Automation Flow Pipeline</span>
                      <span>1 Trigger → {item.actions.length} Action{item.actions.length === 1 ? "" : "s"}</span>
                    </div>

                    <div className="p-4 rounded-lg bg-[#101115] border border-[#2a2a2a] overflow-x-auto custom-scrollbar">
                      <div className="flex items-stretch gap-3 min-w-max">
                        {/* Trigger Node Card */}
                        <div className="w-64 bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-4 flex flex-col justify-between shadow-xl">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#8e9192]">
                              <span className="flex items-center gap-1.5 text-[#c4c0ff]">
                                <Zap className="w-3.5 h-3.5" /> Trigger Node
                              </span>
                              <span>Step 1</span>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-md bg-[#20201f] border border-[#2a2a2a] text-[#c4c0ff] shrink-0">
                                {trigger.icon}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-white leading-tight">{trigger.label}</h4>
                                <p className="text-xs text-[#8e9192] mt-1 leading-relaxed">{trigger.desc}</p>
                              </div>
                            </div>

                            {item.keywords && item.keywords.length > 0 && (
                              <div className="pt-2.5 border-t border-[#2a2a2a] space-y-1.5">
                                <span className="text-[11px] font-semibold text-[#8e9192] block">Keywords</span>
                                <div className="flex flex-wrap gap-1">
                                  {item.keywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-[#20201f] border border-[#2a2a2a] text-[#c4c0ff] rounded-md text-[11px] font-semibold">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 text-xs text-[#8e9192] flex items-center justify-between border-t border-[#2a2a2a] mt-3">
                            <span>Mode</span>
                            <span className="text-white font-semibold">{item.target_mode || "Every"}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-center shrink-0 text-[#8e9192] px-1">
                          <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Action Nodes */}
                        {item.actions.map((act, i) => {
                          const isDM = act.action_type === "send_dm";
                          return (
                            <React.Fragment key={i}>
                              {i > 0 && (
                                <div className="flex items-center justify-center shrink-0 text-[#8e9192] px-1">
                                  <div className="w-7 h-7 rounded-md bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center text-[#c4c0ff]">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              )}

                              <div className="w-72 bg-[#1c1b1b] border border-[#2a2a2a] rounded-lg p-4 flex flex-col justify-between shadow-xl">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs font-semibold text-[#8e9192]">
                                    <span className="flex items-center gap-1.5 text-[#34d399]">
                                      <Send className="w-3.5 h-3.5" /> Action {i + 1}
                                    </span>
                                    <span>Step {i + 2}</span>
                                  </div>

                                  {act.dm_format && (
                                    <div className="flex items-center gap-2 text-xs text-[#8e9192]">
                                      <span>Format:</span>
                                      <span className="px-2 py-0.5 bg-[#20201f] border border-[#2a2a2a] rounded-md text-[#e5e2e1] font-semibold">{act.dm_format}</span>
                                    </div>
                                  )}

                                  {act.messages && act.messages.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                      <span className="text-[11px] font-semibold text-[#8e9192] block">Message Content</span>
                                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                                        {act.messages.map((msg, mi) => (
                                          <div key={mi} className="text-xs text-[#e5e2e1] bg-[#101115] p-2.5 rounded-md border border-[#2a2a2a] leading-relaxed">
                                            "{msg}"
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-3 text-xs text-[#8e9192] flex items-center justify-between border-t border-[#2a2a2a] mt-3">
                                  <span className="capitalize font-semibold">{isDM ? "Direct Message" : "Public Reply"}</span>
                                  <span className="text-[#34d399] font-semibold">Ready</span>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 px-5 bg-[#1c1b1b] border-t border-[#2a2a2a] flex items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={() => {
                      window.location.href = `/dashboard/automations?id=${item.id}&openDelete=true`;
                    }}
                    className="px-3.5 py-1.5 rounded-md bg-[#20201f] hover:bg-rose-500/10 border border-[#2a2a2a] hover:border-rose-500/30 text-[#8e9192] hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        handleToggle(item.id, item.status);
                        setSelectedAutomation(prev => prev ? { ...prev, status: prev.status === "active" ? "disabled" : "active" } : null);
                      }}
                      className="px-3.5 py-1.5 rounded-md bg-[#20201f] hover:bg-white/10 border border-[#2a2a2a] hover:border-[#444748] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isActive ? "Pause Flow" : "Activate Flow"}
                    </button>

                    <a
                      href={`/dashboard/automations?id=${item.id}&mode=edit`}
                      className="px-4 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure Flow</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}