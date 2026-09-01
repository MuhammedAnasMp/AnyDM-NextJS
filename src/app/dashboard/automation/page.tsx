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
  ChevronLeft
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
      label: "Customer Taps Question",
      desc: "Starts when a customer taps a preset question in chat."
    };
  }
  if (isPersistentMenu) {
    return {
      icon: <Menu className="w-4 h-4 text-[#c4c0ff]" />,
      label: "Customer Opens Chat Menu",
      desc: "Triggered when a user selects an option in your chat menu."
    };
  }
  if (item.rule_type === "product_inquiry_comment" || item.rule_type === "comment_automation") {
    const hasKeywords = item.keywords && item.keywords.length > 0;
    return {
      icon: <MessageSquare className="w-4 h-4 text-[#c4c0ff]" />,
      label: hasKeywords ? "Comment with Keywords" : "Any Post Comment",
      desc: hasKeywords
        ? `Triggers on comments containing: ${item.keywords.join(", ")}`
        : "Triggers on any comment on your posts or reels."
    };
  }
  return {
    icon: <Send className="w-4 h-4 text-[#c4c0ff]" />,
    label: "Direct Message Received",
    desc: "Triggers when a customer sends a direct message."
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

  const [automationPage, setAutomationPage] = useState(1);
  const itemsPerPage = 20;

  const totalTriggers = automations.reduce((sum, item) => sum + parseInt(item.count || "0", 10), 0);
  const activeCount = automations.filter(item => item.status === "active").length;
  const followersGainedTotal = automations.reduce((sum, item) => sum + (item.followers_gained || 0), 0);

  const totalAutomationPages = Math.max(1, Math.ceil(automations.length / itemsPerPage));
  const paginatedAutomations = automations.slice((automationPage - 1) * itemsPerPage, automationPage * itemsPerPage);

  return (
    <div className="relative space-y-4 overflow-hidden text-[#e5e2e1] pb-16 w-full font-sans">
      {/* Background Soft Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-50px] h-[300px] w-[550px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/12 to-[#c4c0ff]/0 blur-3xl"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-4 py-2 rounded text-xs font-semibold shadow-xl flex items-center gap-2 border ${toast.type === "success"
              ? "bg-[#1c1b1b] border-[#c4c0ff]/40 text-[#c4c0ff]"
              : toast.type === "error"
                ? "bg-[#1c1b1b] border-rose-500/40 text-rose-300"
                : "bg-[#1c1b1b] border-[#2a2a2a] text-[#e5e2e1]"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#c4c0ff]" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#c4c0ff]" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-4 rounded border border-[#2a2a2a] shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e5e2e1]">
              Automations
            </h1>
          </div>
          <p className="text-xs text-[#8e9192]">
            Automatic replies for comments, direct messages, and chat questions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchAutomations()}
            disabled={loading}
            className="p-2 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white hover:border-[#444748] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh automations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#c4c0ff]" : ""}`} />
          </button>

          <Link
            href="/dashboard/automations"
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </Link>
        </div>
      </div>

      {/* Account Paused Alert */}
      {activeAccount && activeAccount.is_enabled === false && (
        <div className="p-3.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Automations Are Currently Paused</p>
            <p className="text-[#8e9192]">
              Instagram account <span className="text-white">@{activeAccount.username}</span> is paused. Enable it in{" "}
              <Link href="/dashboard/settings/accounts" className="text-[#c4c0ff] underline hover:text-white font-semibold">
                Account Settings
              </Link>{" "}
              to run automations.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8e9192] text-[11px] font-semibold">
            <span>Total Triggered Replies</span>
            <Zap className="w-3.5 h-3.5 text-[#c4c0ff]" />
          </div>
          <div className="text-xl font-semibold text-[#e5e2e1]">{totalTriggers}</div>
          <p className="text-[11px] text-[#8e9192]">Automated message responses</p>
        </div>

        <div className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8e9192] text-[11px] font-semibold">
            <span>Active Rules</span>
            <Play className="w-3.5 h-3.5 text-[#c4c0ff]" />
          </div>
          <div className="text-xl font-semibold text-[#e5e2e1]">{activeCount}</div>
          <p className="text-[11px] text-[#8e9192]">Currently running automations</p>
        </div>

        <div className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8e9192] text-[11px] font-semibold">
            <span>New Followers</span>
            <UserCheck className="w-3.5 h-3.5 text-[#c4c0ff]" />
          </div>
          <div className="text-xl font-semibold text-[#e5e2e1]">+{followersGainedTotal}</div>
          <p className="text-[11px] text-[#8e9192]">Gained from automated replies</p>
        </div>

        <div className="p-3.5 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8e9192] text-[11px] font-semibold">
            <span>Total Rules</span>
            <MessageSquare className="w-3.5 h-3.5 text-[#c4c0ff]" />
          </div>
          <div className="text-xl font-semibold text-[#e5e2e1]">{automations.length}</div>
          <p className="text-[11px] text-[#8e9192]">Configured reply rules</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 rounded bg-[#1c1b1b] border border-[#2a2a2a] shadow-sm space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-[#e5e2e1]">
              Automation Rules
            </h2>
            <span className="text-[11px] text-[#8e9192]">
              ({automations.length})
            </span>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="bg-[#101115] border border-[#2a2a2a] rounded p-0.5 flex gap-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5",
                viewMode === "grid" ? "bg-[#20201f] text-white border border-[#2a2a2a]" : "text-[#8e9192] hover:text-white"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={cn(
                "px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1.5",
                viewMode === "list" ? "bg-[#20201f] text-white border border-[#2a2a2a]" : "text-[#8e9192] hover:text-white"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Content Rendering */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8e9192] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c4c0ff]" />
            <p className="font-semibold text-[#e5e2e1]">Loading automations...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 space-y-3 max-w-sm mx-auto">
            <div className="w-9 h-9 rounded bg-[#20201f] border border-[#2a2a2a] flex items-center justify-center mx-auto text-[#c4c0ff]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-[#e5e2e1]">No Automations Created</h3>
              <p className="text-[11px] text-[#8e9192] leading-relaxed">
                Set up automated replies for post comments, direct messages, or chat menus.
              </p>
            </div>
            <Link
              href="/dashboard/automations"
              className="px-3.5 py-1.5 bg-white text-zinc-950 text-xs font-semibold rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Automation</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2.5"}>
              {paginatedAutomations.map((item) => {
                const isSpecialFlow = item.name === "Welcome Message Flow" || item.name === "Persistent Menu Flow";
                const trigger = getTriggerDetails(item);
                const isActive = item.status === "active";

                const now = new Date();
                const endDate = item.end_at ? new Date(item.end_at) : null;
                const isEnded = (endDate && endDate < now) || item.status === "completed";

                if (viewMode === "list") {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAutomation(item)}
                      className={cn(
                        "bg-[#101115] border border-[#2a2a2a] rounded p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors cursor-pointer hover:border-[#444748]",
                        !isActive && "opacity-75"
                      )}
                    >
                      {/* Left Details */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* <span className={cn("w-2 h-2 rounded-full shrink-0", isActive ? "bg-[#c4c0ff]" : "bg-zinc-600")} /> */}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-xs text-[#e5e2e1] truncate">
                              {item.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#8e9192] flex-wrap">
                            <span className="flex items-center gap-1">
                              {trigger.icon}
                              <span className="text-[#e5e2e1] font-semibold">{trigger.label}</span>
                            </span>

                            <span>{item.actions.length} Action{item.actions.length === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Stats */}
                      <div className="flex items-center gap-3 text-[11px] text-[#8e9192] shrink-0">
                        <span>{item.count || 0} replies</span>
                        <span>•</span>
                        <span>+{item.followers_gained || 0} followers</span>
                        <span className="text-[#e5e2e1] font-semibold ml-1">
                          {isEnded ? "Ended" : isActive ? "Active" : "Paused"}
                        </span>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#2a2a2a]" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggle(item.id, item.status)}
                          className={cn(
                            "w-7 h-4 rounded-full p-0.5 transition-all relative flex items-center outline-none border cursor-pointer",
                            isActive ? "bg-white border-transparent" : "bg-[#20201f] border-[#2a2a2a]",
                            isSpecialFlow && "opacity-50 cursor-not-allowed"
                          )}
                          title={isActive ? "Pause Automation" : "Activate Automation"}
                        >
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full transform transition-transform duration-150 flex items-center justify-center",
                              isActive ? "translate-x-3 bg-zinc-950" : "translate-x-0 bg-[#8e9192]"
                            )}
                          >
                            {togglingId === item.id && (
                              <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            )}
                          </div>
                        </button>

                        <a
                          href={`/dashboard/automations?id=${item.id}&mode=edit`}
                          className="py-1 px-2.5 bg-[#20201f] hover:bg-white/10 border border-[#2a2a2a] rounded text-[11px] font-semibold text-[#e5e2e1] transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-[#c4c0ff]" />
                          <span>Edit</span>
                        </a>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer border border-[#2a2a2a]"
                          title="Delete automation"
                        >
                          {deletingId === item.id ? (
                            <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAutomation(item)}
                    className={cn(
                      "bg-[#101115] border border-[#2a2a2a] rounded flex flex-col justify-between overflow-hidden transition-colors cursor-pointer hover:border-[#444748]",
                      !isActive && "opacity-75"
                    )}
                  >
                    {/* Card Header */}
                    <div className="p-3.5 pb-2.5 border-b border-[#2a2a2a] bg-[#1c1b1b]/50">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="space-y-0.5 min-w-0">
                          <h3 className="font-semibold text-xs text-[#e5e2e1] truncate leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#8e9192]">
                            <span className="flex items-center gap-1 font-semibold">
                              <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#c4c0ff]" : "bg-zinc-600")} />
                              {isEnded ? "Ended" : isActive ? "Active" : "Paused"}
                            </span>
                            <span>•</span>
                            <span>{item.count || 0} replies</span>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(item.id, item.status);
                          }}
                          className={cn(
                            "w-7 h-4 rounded-full p-0.5 transition-all relative flex items-center outline-none border cursor-pointer shrink-0",
                            isActive ? "bg-white border-transparent" : "bg-[#20201f] border-[#2a2a2a]",
                            isSpecialFlow && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full transform transition-transform duration-150 flex items-center justify-center",
                              isActive ? "translate-x-3 bg-zinc-950" : "translate-x-0 bg-[#8e9192]"
                            )}
                          >
                            {togglingId === item.id && (
                              <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="flex items-start gap-2 p-2.5 rounded bg-[#1c1b1b] border border-[#2a2a2a]">
                        <div className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] shrink-0">
                          {trigger.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-semibold text-[#e5e2e1]">{trigger.label}</h4>
                          <p className="text-[10px] text-[#8e9192] truncate mt-0.5">
                            {trigger.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8e9192]">
                        <span className="font-semibold">
                          {item.actions.length} Action{item.actions.length === 1 ? "" : "s"}
                        </span>
                        <span className="text-[#c4c0ff] font-semibold flex items-center gap-0.5">
                          Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-3.5 py-2 bg-[#1c1b1b]/60 border-t border-[#2a2a2a] flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`/dashboard/automations?id=${item.id}`}
                        className="flex-1 py-1 px-2.5 bg-[#20201f] hover:bg-white/10 border border-[#2a2a2a] rounded text-[11px] font-semibold text-[#e5e2e1] transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#c4c0ff]" />
                        <span>Configure</span>
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
                        className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] hover:bg-rose-500/10 text-[#8e9192] hover:text-rose-400 transition-colors cursor-pointer"
                        title={isSpecialFlow ? "Configure Settings" : "Delete Automation"}
                      >
                        {deletingId === item.id ? (
                          <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Footer */}
            {automations.length > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a] text-xs">
                <span className="text-[11px] text-[#8e9192]">
                  Page {automationPage} of {totalAutomationPages} ({automations.length} total rules)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAutomationPage((p) => Math.max(1, p - 1))}
                    disabled={automationPage === 1}
                    className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAutomationPage((p) => Math.min(totalAutomationPages, p + 1))}
                    disabled={automationPage >= totalAutomationPages}
                    className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Popup Modal */}
      <AnimatePresence>
        {selectedAutomation && (() => {
          const item = selectedAutomation;
          const isSpecialFlow = item.name === "Welcome Message Flow" || item.name === "Persistent Menu Flow";
          const trigger = getTriggerDetails(item);
          const isActive = item.status === "active";
          const now = new Date();
          const endDate = item.end_at ? new Date(item.end_at) : null;
          const isEnded = (endDate && endDate < now) || item.status === "completed";
          const startFormatted = formatDateDisplay(item.start_at);
          const endFormatted = formatDateDisplay(item.end_at);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded overflow-hidden shadow-2xl flex flex-col my-auto text-[#e5e2e1]"
              >
                {/* Modal Header */}
                <div className="p-3.5 px-4 border-b border-[#2a2a2a] flex items-center justify-between shrink-0 bg-[#1c1b1b]">
                  <div className="flex items-center gap-2 min-w-0 pr-2">

                    <h2 className="text-sm font-semibold text-white tracking-tight truncate">{item.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="p-1 rounded bg-[#20201f] border border-[#2a2a2a] text-[#8e9192] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 space-y-3">
                  {/* Trigger Details */}
                  <div className="p-3 rounded bg-[#1c1b1b] border border-[#2a2a2a] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#8e9192]">
                      {trigger.icon}
                      <span className="font-semibold text-white">{trigger.label}</span>
                    </div>
                    <p className="text-[11px] text-[#8e9192] leading-relaxed">{trigger.desc}</p>
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.keywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-[#20201f] border border-[#2a2a2a] text-[#c4c0ff] rounded text-[10px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Messages */}
                  {item.actions && item.actions.length > 0 && (
                    <div className="p-3 rounded bg-[#1c1b1b] border border-[#2a2a2a] space-y-1.5">
                      <span className="text-[11px] font-semibold text-[#8e9192] block">Response Message</span>
                      {item.actions.flatMap(a => a.messages || []).slice(0, 2).map((msg, mi) => (
                        <p key={mi} className="text-xs text-[#e5e2e1] bg-[#101115] p-2 rounded border border-[#2a2a2a] leading-relaxed italic">
                          "{msg}"
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs text-[#8e9192] pt-1 px-1">
                    <span>{item.count || 0} total replies sent</span>
                    <span>+{item.followers_gained || 0} new followers</span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-3 px-4 bg-[#1c1b1b] border-t border-[#2a2a2a] flex items-center justify-between gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (isSpecialFlow) {
                        const tabParam = item.name === "Welcome Message Flow" ? "icebreakers" : "persistent_menu";
                        window.location.href = `/dashboard/automations?welcome=${tabParam}`;
                        return;
                      }
                      handleDelete(item.id);
                    }}
                    className="px-2.5 py-1.5 rounded bg-[#20201f] hover:bg-rose-500/10 border border-[#2a2a2a] text-[#8e9192] hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleToggle(item.id, item.status);
                        setSelectedAutomation(prev => prev ? { ...prev, status: prev.status === "active" ? "disabled" : "active" } : null);
                      }}
                      className="px-3 py-1.5 rounded bg-[#20201f] border border-[#2a2a2a] hover:border-[#444748] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isActive ? "Pause Rule" : "Activate Rule"}
                    </button>

                    <a
                      href={`/dashboard/automations?id=${item.id}&mode=edit`}
                      className="px-3 py-1.5 rounded bg-white text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure</span>
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