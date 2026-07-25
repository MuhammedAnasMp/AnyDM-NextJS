"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Play,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  ChevronRight,
  Edit3,
  CornerDownRight,
  AlertCircle,
  HelpCircle,
  Menu,
  Send,
  Calendar,
  UserCheck,
  Eye,
  Layers,
  X,
  LayoutGrid,
  List
} from "lucide-react";
import api from "@/lib/services/api.service";
import Toast from "@/components/Toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return null;
  }
};

const getTriggerDetails = (item: any) => {
  const isWelcomeFlow = item.name === "Welcome Message Flow";
  const isPersistentMenu = item.name === "Persistent Menu Flow";

  if (isWelcomeFlow) {
    return {
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
      label: "User Taps Options",
      desc: "Starts when a new user selects a preset question in your chat."
    };
  }
  if (isPersistentMenu) {
    return {
      icon: <Menu className="w-4 h-4 text-sky-400" />,
      label: "User Opens Menu",
      desc: "Triggered from options in the persistent chat menu."
    };
  }
  if (item.rule_type === "product_inquiry_comment" || item.rule_type === "comment_automation") {
    const hasKeywords = item.keywords && item.keywords.length > 0;
    return {
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
      label: hasKeywords ? "Specific Comment" : "Any Comment",
      desc: hasKeywords
        ? `Comments containing: ${item.keywords.join(', ')}`
        : "Triggered by any comment on your post/reel."
    };
  }
  return {
    icon: <Send className="w-4 h-4 text-emerald-400" />,
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

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "info",
    visible: false
  });

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
      setToast({
        message: "Failed to load automations. Please refresh.",
        type: "error",
        visible: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [activeAccountId]);

  const handleToggle = async (id: string, currentStatus: "active" | "disabled") => {
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
        setToast({
          message: `Automation ${nextEnabled ? "activated" : "paused"}.`,
          type: "success",
          visible: true
        });
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      setToast({
        message: "Failed to update status. Please try again.",
        type: "error",
        visible: true
      });
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
        setToast({
          message: "Automation deleted successfully.",
          type: "success",
          visible: true
        });
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      setToast({
        message: "Failed to delete automation.",
        type: "error",
        visible: true
      });
    } finally {
      setDeletingId(null);
    }
  };

  const totalTriggers = automations.reduce((sum, item) => sum + parseInt(item.count || "0", 10), 0);
  const activeCount = automations.filter(item => item.status === "active").length;
  const triggerTypes = automations.map(item => item.rule_type);
  const mostCommonType = triggerTypes.length > 0
    ? triggerTypes.sort((a, b) => triggerTypes.filter(v => v === a).length - triggerTypes.filter(v => v === b).length).pop()
    : "None";

  const formatRuleType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getRuleTypeBadgeStyles = (type: string) => {
    if (type.includes("comment")) return "border-[#8FE3FF]/20 text-[#8FE3FF] bg-[#8FE3FF]/5";
    if (type.includes("story")) return "border-[#B6B2FF]/20 text-[#B6B2FF] bg-[#B6B2FF]/5";
    return "border-[#E0E0E0]/20 text-[#E0E0E0] bg-[#E0E0E0]/5";
  };

  return (
    <div className="min-h-screen .bg-[#131313] text-[#e5e2e1] font-sans antialiased selection:bg-[#c6c6c7]/30">

      {/* Dense Sticky Header Overlay */}


      <main className="w-full">

        {/* Compact Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3.5">

          <header className="sticky top-0 z-40 w-full backdrop-blur-md .bg-[#131313]/85 border-b border-[#444748]">
            <div className=" mx-auto h-12 flex items-center justify-between">

              <div>
                <h1 className="text-base font-bold tracking-tight text-[#e5e2e1] flex items-center gap-1.5">
                  <span>Instagram Automations</span>
                  {/* <Sparkles className="w-3.5 h-3.5 text-[#B6B2FF] shrink-0" /> */}
                </h1>

              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fetchAutomations()}
                  disabled={loading}
                  className="p-1.5 h-8 w-8 bg-[#1c1b1b] hover:bg-[#20201f] border border-[#444748] rounded text-[#e5e2e1] transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/dashboard/automations"
                  className="py-1 h-8 px-2.5 bg-white hover:bg-[#e5e2e1] text-[#131313] rounded text-[13px] font-bold tracking-tight transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Workflow</span>
                </Link>
              </div>
            </div>
          </header>
        </div>

        {activeAccount && activeAccount.is_enabled === false && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200 text-xs flex items-center gap-3 shadow-md backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold">Automations are Paused</p>
              <p className="text-zinc-400">
                The selected Instagram account <span className="font-mono text-zinc-300">@{activeAccount.username}</span> is currently paused. No automations will run until you resume it in <Link href="/dashboard/settings/accounts" className="text-amber-400 underline hover:text-amber-300">Account Settings</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Structured Grid Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { title: "Total Executions", value: totalTriggers, icon: Zap, color: "text-[#E0E0E0]" },
            { title: "Active Workflows", value: activeCount, icon: Play, color: "text-[#E0E0E0]" },
            { title: "Followers Gained", value: `+${automations.reduce((sum, item) => sum + (item.followers_gained || 0), 0)}`, icon: UserCheck, color: "text-[#E0E0E0]" },
            { title: "Saved Templates", value: automations.length, icon: MessageSquare, color: "text-[#c4c7c8]" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#1c1b1b] border border-[#444748] rounded p-3 flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-semibold text-[#c4c7c8]/85 uppercase tracking-wider block">{stat.title}</span>
                  <span className="text-lg font-bold text-[#e5e2e1] tracking-tight block">{stat.value}</span>
                </div>
                <div className="w-7 h-7 rounded bg-[#20201f] border border-[#444748]/60 flex items-center justify-center shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Grid/List Setup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#c4c7c8]">
                Configured Profiles & Rules
              </h2>
              <span className="px-1.5 py-0.2 bg-[#20201f] border border-[#444748] rounded-sm text-[9px] text-[#c4c7c8] font-mono">
                {automations.length}
              </span>
            </div>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'grid'
                  ? 'bg-[#2a2a2a] text-white font-semibold shadow-sm border border-white/10'
                  : 'text-zinc-400 hover:text-white'
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'list'
                  ? 'bg-[#2a2a2a] text-white font-semibold shadow-sm border border-white/10'
                  : 'text-zinc-400 hover:text-white'
                  }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-40 bg-[#1c1b1b] border border-[#444748] rounded animate-pulse flex flex-col justify-between p-3.5">
                  <div className="space-y-2">
                    <div className="h-3.5 bg-[#20201f] rounded-sm w-2/3" />
                    <div className="h-3 bg-[#20201f] rounded-sm w-1/3" />
                  </div>
                  <div className="h-7 bg-[#20201f] rounded-sm w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : automations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center p-8 bg-[#1c1b1b] border border-[#444748] rounded"
            >
              <div className="w-8 h-8 rounded bg-[#20201f] border border-[#444748] flex items-center justify-center mb-3">
                <AlertTriangle className="w-4 h-4 text-[#8e9192]" />
              </div>
              <h3 className="text-xs font-semibold text-[#e5e2e1] mb-0.5">No Active Rule Sets</h3>
              <p className="text-[11px] text-[#c4c7c8] max-w-xs mb-3">
                Select a visual trigger set to automatically configure communication hooks.
              </p>
              <Link
                href="/dashboard/automations"
                className="py-1 px-2.5 bg-white hover:bg-[#e5e2e1] text-[#131313] rounded text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <span>Add Template</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-2.5"}>
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
                        transition={{ duration: 0.12 }}
                        onClick={() => setSelectedAutomation(item)}
                        className={`bg-[#171717] border rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm transition-all cursor-pointer group hover:border-[#555555] ${isEnded
                          ? "border-rose-900/60 bg-rose-950/10 shadow-rose-950/20"
                          : isActive
                            ? "border-[#3e3e3e] shadow-black/40"
                            : "border-[#262626] opacity-80"
                          }`}
                      >
                        {/* Left: Name & Trigger details */}
                        <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 md:mt-0 ${isEnded ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm text-[#e5e5e5] group-hover:text-white tracking-tight truncate transition-colors">
                                {item.name}
                              </h3>
                              {isSpecialFlow && (
                                <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-sky-950/20 text-sky-300 border-sky-900/30 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Special Flow
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#a3a3a3] flex-wrap">
                              <span className="flex items-center gap-1">
                                {trigger.icon}
                                <span className="text-zinc-300 font-medium">{trigger.label}</span>
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span>{item.actions.length} Action{item.actions.length === 1 ? '' : 's'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Metrics & Schedule */}
                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-medium text-zinc-300">
                              <strong className="text-white font-bold">{item.count || 0}</strong> runs
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              +{item.followers_gained || 0} followers
                            </span>
                          </div>

                          {/* Schedule Date Badge */}
                          {isEnded ? (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border tracking-wide uppercase bg-rose-950/50 text-rose-400 border-rose-800/60 hidden lg:flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-rose-400" />
                              Ended
                            </span>
                          ) : isNotStarted ? (
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-amber-950/30 text-amber-300 border-amber-800/40 hidden lg:flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-amber-400" />
                              Starts {startFormatted}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-medium rounded-full border tracking-wide uppercase bg-zinc-800/40 text-zinc-400 border-zinc-700/30 hidden lg:flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                              Always Active
                            </span>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#262626]" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggle(item.id, item.status)}
                            className={`w-8 h-4.5 rounded-full p-0.5 transition-all relative flex items-center outline-none border ${isActive
                              ? "bg-white border-transparent"
                              : "bg-[#262626] border-[#3a3a3a]"
                              } ${isSpecialFlow ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                            title={isActive ? "Pause Automation" : "Activate Automation"}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-150 flex items-center justify-center ${isActive ? "translate-x-3.5 bg-[#171717]" : "translate-x-0 bg-[#a3a3a3]"
                              }`}>
                              {togglingId === item.id && (
                                <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                              )}
                            </div>
                          </button>

                          <a
                            href={`/dashboard/automations?id=${item.id}`}
                            className="py-1 px-2.5 bg-[#222222] hover:bg-[#2c2c2c] border border-[#2e2e2e] rounded-md text-xs font-semibold text-[#e5e5e5] transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-zinc-400" />
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
                            className="p-1.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            {deletingId === item.id ? (
                              <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
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
                      className={`bg-[#171717] border rounded-xl flex flex-col justify-between shadow-md overflow-hidden transition-all duration-200 cursor-pointer group hover:border-[#555555] ${isEnded
                        ? "border-rose-900/60 bg-rose-950/10 shadow-rose-950/20"
                        : isActive
                          ? "border-[#3e3e3e] shadow-black/40"
                          : "border-[#262626] opacity-80"
                        }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 pb-3 border-b border-[#262626] bg-[#1a1a1a]/50">
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-sm text-[#e5e5e5] group-hover:text-white tracking-tight truncate leading-tight transition-colors">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-[#a3a3a3] flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isEnded ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                                {isEnded ? <span className="text-rose-400 font-bold">Ended</span> : isActive ? 'Active' : 'Paused'}
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-[10px] font-medium text-[#a3a3a3]">
                                {item.count || 0} runs
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-400" />
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
                            className={`w-9 h-5 rounded-full p-0.5 transition-all relative flex items-center outline-none border ${isActive
                              ? "bg-white border-transparent"
                              : "bg-[#262626] border-[#3a3a3a]"
                              } ${isSpecialFlow ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-150 flex items-center justify-center ${isActive ? "translate-x-4 bg-[#171717]" : "translate-x-0 bg-[#a3a3a3]"
                              }`}>
                              {togglingId === item.id && (
                                <div className="w-2 h-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Automation Category & Date Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">

                          {isSpecialFlow && (
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-sky-950/20 text-sky-300 border-sky-900/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Special Flow
                            </span>
                          )}

                          {/* Schedule Date Badge */}
                          {isEnded ? (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border tracking-wide uppercase bg-rose-950/50 text-rose-400 border-rose-800/60 flex items-center gap-1 shadow-sm">
                              <Calendar className="w-2.5 h-2.5 text-rose-400" />
                              Ended {endFormatted ? `on ${endFormatted}` : '(Expired)'}
                            </span>
                          ) : isNotStarted ? (
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-amber-950/30 text-amber-300 border-amber-800/40 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-amber-400" />
                              Starts {startFormatted}
                            </span>
                          ) : startFormatted || endFormatted ? (
                            <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full border tracking-wide uppercase bg-sky-950/30 text-sky-300 border-sky-800/40 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-sky-400" />
                              {startFormatted ? startFormatted : 'Now'} – {endFormatted ? endFormatted : 'No End'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] font-medium rounded-full border tracking-wide uppercase bg-zinc-800/40 text-zinc-400 border-zinc-700/30 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                              Always Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body - Basic Info & Click Prompt */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#1c1c1c] border border-[#262626]">
                          <div className="p-1.5 rounded bg-zinc-800 shrink-0">
                            {trigger.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-[#e5e5e5]">{trigger.label}</h4>
                            <p className="text-[11px] text-[#a3a3a3] truncate mt-0.5">
                              {trigger.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#a3a3a3] pt-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Layers className="w-3.5 h-3.5 text-zinc-500" />
                            {item.actions.length} Action{item.actions.length === 1 ? '' : 's'}
                          </span>
                          <span className="text-sky-400 group-hover:text-sky-300 font-semibold flex items-center gap-1 text-[11px] transition-colors">
                            View Details <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Footer */}
                      <div className="px-4 py-3 bg-[#1a1a1a]/40 border-t border-[#262626] flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`/dashboard/automations?id=${item.id}`}
                          className="flex-1 py-1.5 px-3 bg-[#222222] hover:bg-[#2c2c2c] border border-[#2e2e2e] rounded-lg text-xs font-semibold text-[#e5e5e5] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
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
                          className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${isSpecialFlow
                            ? "bg-transparent hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400 border-zinc-800/40 cursor-pointer"
                            : "bg-[#1c1c1c] border-[#2e2e2e] hover:bg-rose-950/20 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400"
                            }`}
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
      </main>

      {/* Glass Monochrome Details Popup Modal */}
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
          const isSpecialFlow = item.name === "Welcome Message Flow" || item.name === "Persistent Menu Flow";

          return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto font-inter">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-4xl bg-[#131313] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-white relative flex flex-col my-8 max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#181818]/50">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                        <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-zinc-500'
                          }`} />
                        {isEnded ? 'Ended' : isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">{item.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  {/* Quick Metrics Cards Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#181818] border border-zinc-800/60 rounded-xl p-4 space-y-1.5">
                      <span className="text-xs font-medium text-zinc-400 block">Total Runs</span>
                      <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Zap className="w-4 h-4 text-zinc-400" />
                        <span>{item.count || 0}</span>
                      </div>
                    </div>
                    <div className="bg-[#181818] border border-zinc-800/60 rounded-xl p-4 space-y-1.5">
                      <span className="text-xs font-medium text-zinc-400 block">Followers Gained</span>
                      <div className="flex items-center gap-2 text-lg font-semibold text-white">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>+{item.followers_gained || 0}</span>
                      </div>
                    </div>
                    <div className="bg-[#181818] border border-zinc-800/60 rounded-xl p-4 space-y-1.5">
                      <span className="text-xs font-medium text-zinc-400 block">Schedule</span>
                      <div className="text-xs font-medium text-zinc-300 truncate pt-1">
                        {startFormatted && endFormatted ? `${startFormatted} – ${endFormatted}` : startFormatted ? `From ${startFormatted}` : 'Always Active'}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Left-to-Right Visual Flow Diagram */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400 block">
                        Automation Flow Pipeline
                      </span>
                      <span className="text-xs text-zinc-500">
                        1 Trigger → {item.actions.length} Action{item.actions.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#181818]/60 border border-zinc-800/60 overflow-x-auto custom-scrollbar">
                      <div className="flex items-stretch gap-3 min-w-max">

                        {/* Step 1: TRIGGER NODE CARD */}
                        <div className="w-64 bg-[#1c1c1c] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-zinc-400" /> Trigger Node
                              </span>
                              <span className="text-xs text-zinc-600">Step 1</span>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300 shrink-0">
                                {trigger.icon}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-white leading-tight">{trigger.label}</h4>
                                <p className="text-xs text-zinc-400 mt-1 leading-snug">{trigger.desc}</p>
                              </div>
                            </div>

                            {item.keywords && item.keywords.length > 0 && (
                              <div className="pt-2.5 border-t border-zinc-800/80 space-y-1.5">
                                <span className="text-[11px] font-medium text-zinc-400 block">Keywords</span>
                                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                  {item.keywords.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-xs">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 text-xs text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 mt-3">
                            <span>Mode</span>
                            <span className="text-zinc-300 font-medium">{item.target_mode || 'Every'}</span>
                          </div>
                        </div>

                        {/* CONNECTOR ARROW */}
                        <div className="flex items-center justify-center shrink-0 text-zinc-600 px-1">
                          <div className="w-7 h-7 rounded-full bg-zinc-800/50 border border-zinc-800 flex items-center justify-center">
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                          </div>
                        </div>

                        {/* Step 2+: ACTION NODE CARDS */}
                        {item.actions.map((act, i) => {
                          const isDM = act.action_type === 'send_dm';
                          return (
                            <React.Fragment key={i}>
                              {i > 0 && (
                                <div className="flex items-center justify-center shrink-0 text-zinc-600 px-1">
                                  <div className="w-7 h-7 rounded-full bg-zinc-800/50 border border-zinc-800 flex items-center justify-center">
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                                  </div>
                                </div>
                              )}

                              <div className="w-72 bg-[#1c1c1c] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                                      <Send className="w-3.5 h-3.5 text-zinc-400" /> Action {i + 1}
                                    </span>
                                    <span className="text-xs text-zinc-600">Step {i + 2}</span>
                                  </div>

                                  {act.dm_format && (
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                      <span className="text-zinc-500">Format:</span>
                                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300">{act.dm_format}</span>
                                    </div>
                                  )}

                                  {act.messages && act.messages.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                      <span className="text-[11px] font-medium text-zinc-400 block">Message Content</span>
                                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                                        {act.messages.map((msg, mi) => (
                                          <div key={mi} className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60 leading-relaxed">
                                            "{msg}"
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-3 text-xs text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 mt-3">
                                  <span className="capitalize">{isDM ? 'Direct Message' : 'Public Reply'}</span>
                                  <span className="text-zinc-300 font-medium">Ready</span>
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
                <div className="px-6 py-4 bg-[#181818]/50 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      if (isSpecialFlow) {
                        const tabParam = item.name === "Welcome Message Flow" ? "icebreakers" : "persistent_menu";
                        window.location.href = `/dashboard/automations?welcome=${tabParam}`;
                        return;
                      }
                      handleDelete(item.id);
                      setSelectedAutomation(null);
                    }}
                    className="px-4 py-2 rounded bg-zinc-800/40 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-900/50 text-zinc-400 hover:text-rose-400 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        handleToggle(item.id, item.status);
                        setSelectedAutomation(prev => prev ? { ...prev, status: prev.status === 'active' ? 'disabled' : 'active' } : null);
                      }}
                      className="px-4 py-2 rounded bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      {isActive ? 'Pause Flow' : 'Activate Flow'}
                    </button>

                    <a
                      href={`/dashboard/automations?id=${item.id}`}
                      className="px-4 py-2 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}